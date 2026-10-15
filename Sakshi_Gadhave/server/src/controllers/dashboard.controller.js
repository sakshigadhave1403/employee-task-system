const Employee = require('../models/Employee');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { buildTaskFilter } = require('../utils/taskQuery');

const toMap = (rows) => rows.reduce((acc, r) => ({ ...acc, [String(r._id)]: r.count }), {});

exports.get = asyncHandler(async (req, res) => {
  const [employeeRows, taskRows, overdue, workloadRows, employees] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    // same overdue rule as the task list and CSV
    Task.countDocuments(buildTaskFilter({ overdue: 'true' })),
    Task.aggregate([
      { $match: { status: { $in: ['Todo', 'In Progress'] }, assignedEmployee: { $ne: null } } },
      { $group: { _id: '$assignedEmployee', count: { $sum: 1 } } },
    ]),
    Employee.find().select('employeeId fullName status department').lean(),
  ]);

  const e = toMap(employeeRows);
  const t = toMap(taskRows);
  const load = toMap(workloadRows);

  const workload = employees
    .map((emp) => ({ ...emp, activeTasks: load[String(emp._id)] || 0 }))
    .sort((a, b) => b.activeTasks - a.activeTasks || a.fullName.localeCompare(b.fullName));

  res.json({
    success: true,
    data: {
      employees: {
        total: employeeRows.reduce((sum, r) => sum + r.count, 0),
        active: e['Active'] || 0,
        inactive: e['Inactive'] || 0,
        onLeave: e['On Leave'] || 0,
      },
      tasks: {
        total: taskRows.reduce((sum, r) => sum + r.count, 0),
        todo: t['Todo'] || 0,
        inProgress: t['In Progress'] || 0,
        completed: t['Completed'] || 0,
        cancelled: t['Cancelled'] || 0,
        overdue,
      },
      workload,
    },
  });
});