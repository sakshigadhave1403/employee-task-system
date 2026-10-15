const Employee = require('../models/Employee');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { parsePagination, buildPagination } = require('../utils/pagination');

const EDITABLE = [
  'fullName', 'email', 'phone', 'department', 'role',
  'joiningDate', 'status', 'skills', 'leaveStart', 'leaveEnd',
];
const CREATABLE = ['employeeId', ...EDITABLE];
const SORTABLE = ['createdAt', 'fullName', 'joiningDate', 'department'];

// keep only allowed fields (so nobody can set activeTaskCount etc.)
const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? { ...acc, [k]: obj[k] } : acc), {});

exports.list = asyncHandler(async (req, res) => {
  const { search, department, status, sortBy, order } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};
  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { employeeId: rx }];
  }
  if (department) filter.department = department;
  if (status) filter.status = status;

  const field = SORTABLE.includes(sortBy) ? sortBy : 'createdAt';
  const dir = order ? (order === 'asc' ? 1 : -1) : field === 'createdAt' ? -1 : 1;

  const [data, total] = await Promise.all([
    Employee.find(filter).sort({ [field]: dir, _id: 1 }).collation({ locale: 'en' }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);

  res.json({ success: true, data, pagination: buildPagination(total, page, limit) });
});

// small list for the "Assigned Employee" dropdown in the task form
exports.options = asyncHandler(async (req, res) => {
  const data = await Employee.find()
    .select('employeeId fullName status department leaveStart leaveEnd activeTaskCount')
    .sort({ fullName: 1 })
    .limit(500);
  res.json({ success: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new AppError(404, 'Employee not found');
  res.json({ success: true, data: emp });
});

exports.create = asyncHandler(async (req, res) => {
  const emp = await Employee.create(pick(req.body, CREATABLE)); // duplicate id/email -> 409
  res.status(201).json({ success: true, data: emp });
});

exports.update = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new AppError(404, 'Employee not found');

  emp.set(pick(req.body, EDITABLE)); // employeeId cannot be changed
  await emp.save();

  // keep the name copy on this employee's tasks fresh
  await Task.updateMany(
    { assignedEmployee: emp._id },
    { $set: { 'employeeSnapshot.fullName': emp.fullName, 'employeeSnapshot.email': emp.email } }
  );

  res.json({ success: true, data: emp });
});

exports.remove = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new AppError(404, 'Employee not found');

  const activeCount = await Task.countDocuments({
    assignedEmployee: emp._id,
    status: { $in: ['Todo', 'In Progress'] },
  });
  if (activeCount > 0) {
    throw new AppError(400, `Cannot delete employee with ${activeCount} active task(s). Complete or cancel them first.`);
  }

     // old tasks keep employeeSnapshot (name, ID, email); the link to the employee is removed
   await Task.updateMany({ assignedEmployee: emp._id }, { $set: { assignedEmployee: null } });
   await emp.deleteOne();
  res.json({ success: true, message: 'Employee deleted' });
});