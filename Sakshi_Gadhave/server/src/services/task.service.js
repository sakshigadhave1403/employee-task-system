const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Counter = require('../models/Counter');
const AppError = require('../utils/AppError');
const { todayStart } = require('../utils/dateUtils');
const { buildTaskFilter, buildTaskSort } = require('../utils/taskQuery');
const { parsePagination, buildPagination } = require('../utils/pagination');

const MAX_ACTIVE_TASKS = 3;
const ACTIVE = ['Todo', 'In Progress'];

const TRANSITIONS = {
  'Todo': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
};

/* ---------- helpers ---------- */

const nextTaskId = async () => {
  const c = await Counter.findByIdAndUpdate('task', { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `TSK-${String(c.seq).padStart(3, '0')}`;
};

const isOverdue = (task) =>
  !['Completed', 'Cancelled'].includes(task.status) && new Date(task.dueDate) < todayStart();

const withOverdue = (task) => {
  const obj = task.toObject ? task.toObject() : task;
  return { ...obj, isOverdue: isOverdue(obj) };
};

const checkDates = (start, due) => {
  if (new Date(due) < new Date(start)) {
    throw new AppError(400, 'Due date cannot be earlier than start date');
  }
};

const checkEmployeeCanTakeTask = (emp, startDate) => {
  if (emp.status === 'Inactive') {
    throw new AppError(400, 'Cannot assign task to an inactive employee');
  }
  if (emp.status === 'On Leave') {
    const s = new Date(startDate);
    if (s >= emp.leaveStart && s <= emp.leaveEnd) {
      throw new AppError(400, 'Employee is on leave during the task start date');
    }
  }
};

// atomic: adds 1 only if the employee has fewer than 3 active tasks
const reserveSlot = async (employeeId) => {
  const ok = await Employee.findOneAndUpdate(
    { _id: employeeId, activeTaskCount: { $lt: MAX_ACTIVE_TASKS } },
    { $inc: { activeTaskCount: 1 } }
  );
  if (!ok) {
    throw new AppError(400, 'Employee already has 3 active tasks. Please choose another employee.');
  }
};

const releaseSlot = (employeeId) =>
  Employee.updateOne(
    { _id: employeeId, activeTaskCount: { $gt: 0 } },
    { $inc: { activeTaskCount: -1 } }
  );

const snapshotOf = (emp) => ({
  employeeId: emp.employeeId,
  fullName: emp.fullName,
  email: emp.email,
});

/* ---------- read ---------- */

exports.listTasks = async (query) => {
  const filter = buildTaskFilter(query);
  const sort = buildTaskSort(query);
  const { page, limit, skip } = parsePagination(query);

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).collation({ locale: 'en' }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return { data: tasks.map(withOverdue), pagination: buildPagination(total, page, limit) };
};

exports.getTask = async (id) => {
  const task = await Task.findById(id).populate(
    'assignedEmployee',
    'employeeId fullName email status department'
  );
  if (!task) throw new AppError(404, 'Task not found');

  const result = withOverdue(task);
  result.employeeDeleted = !task.assignedEmployee; // true if the employee was deleted later
  return result;
};

/* ---------- create ---------- */

exports.createTask = async (data) => {
  const { title, description, assignedEmployee, department, priority, startDate, dueDate } = data;

  if (!assignedEmployee) throw new AppError(400, 'Assigned employee is required');
  if (!startDate || !dueDate) throw new AppError(400, 'Start date and due date are required');
  checkDates(startDate, dueDate);

  const emp = await Employee.findById(assignedEmployee);
  if (!emp) throw new AppError(404, 'Employee not found');
  checkEmployeeCanTakeTask(emp, startDate);

  await reserveSlot(emp._id);
  try {
    const task = await Task.create({
      taskId: await nextTaskId(),
      title,
      description,
      department,
      priority,
      startDate,
      dueDate,
      assignedEmployee: emp._id,
      employeeSnapshot: snapshotOf(emp),
      status: 'Todo', // always Todo
    });
    return withOverdue(task);
  } catch (err) {
    await releaseSlot(emp._id);
    throw err;
  }
};

/* ---------- edit ---------- */

exports.updateTask = async (id, data) => {
  const task = await Task.findById(id);
  if (!task) throw new AppError(404, 'Task not found');

  if (['Completed', 'Cancelled'].includes(task.status)) {
    throw new AppError(400, 'Completed or Cancelled tasks cannot be edited');
  }

  const startDate = data.startDate || task.startDate;
  const dueDate = data.dueDate || task.dueDate;
  checkDates(startDate, dueDate);

  const oldEmployeeId = task.assignedEmployee ? String(task.assignedEmployee) : null;
  const newEmployeeId = data.assignedEmployee ? String(data.assignedEmployee) : oldEmployeeId;
  if (!newEmployeeId) throw new AppError(400, 'Assigned employee is required');

  const employeeChanged = newEmployeeId !== oldEmployeeId;
  const startChanged = new Date(startDate).getTime() !== new Date(task.startDate).getTime();

  const emp = await Employee.findById(newEmployeeId);
  if (!emp) throw new AppError(404, 'Employee not found');

  // run assignment rules again only when employee or start date changed
  if (employeeChanged || startChanged) checkEmployeeCanTakeTask(emp, startDate);

  // status, taskId, completedDate from the request are ignored on purpose
  ['title', 'description', 'department', 'priority'].forEach((key) => {
    if (data[key] !== undefined) task[key] = data[key];
  });
  task.startDate = startDate;
  task.dueDate = dueDate;

  if (employeeChanged) {
    await reserveSlot(emp._id);
    task.assignedEmployee = emp._id;
    task.employeeSnapshot = snapshotOf(emp);
  }

  try {
    await task.save();
  } catch (err) {
    if (employeeChanged) await releaseSlot(emp._id);
    throw err;
  }

  if (employeeChanged && oldEmployeeId) await releaseSlot(oldEmployeeId);
  return withOverdue(task);
};

/* ---------- delete ---------- */

exports.deleteTask = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new AppError(404, 'Task not found');

  if (ACTIVE.includes(task.status) && task.assignedEmployee) {
    await releaseSlot(task.assignedEmployee);
  }
};

/* ---------- status ---------- */

exports.updateStatus = async (id, newStatus) => {
  const task = await Task.findById(id);
  if (!task) throw new AppError(404, 'Task not found');

  const allowed = TRANSITIONS[task.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(400, `Cannot change status from ${task.status} to ${newStatus}`);
  }

  const update = { status: newStatus };
  if (newStatus === 'Completed') update.completedDate = new Date(); // set by backend only

  const updated = await Task.findOneAndUpdate(
    { _id: id, status: task.status },
    update,
    { new: true }
  );
  if (!updated) {
    throw new AppError(400, 'Task status was changed by someone else. Please refresh.');
  }

  if (['Completed', 'Cancelled'].includes(newStatus) && task.assignedEmployee) {
    await releaseSlot(task.assignedEmployee);
  }
  return withOverdue(updated);
};

exports.TRANSITIONS = TRANSITIONS;
exports.withOverdue = withOverdue;
exports.isOverdue = isOverdue;