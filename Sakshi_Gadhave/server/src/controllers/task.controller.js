const Task = require('../models/Task');
const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');
const { buildTaskFilter, buildTaskSort } = require('../utils/taskQuery');
const { csvRow } = require('../utils/csv');

exports.list = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.query);
  res.json({ success: true, ...result });
});

exports.getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.params.id);
  res.json({ success: true, data: task });
});

exports.create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });
});

exports.update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json({ success: true, data: task });
});

exports.remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ success: true, message: 'Task deleted' });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data: task });
});

/* ---------- CSV export (all rows matching the filters, no pagination) ---------- */

const CSV_HEADERS = [
  'Task ID', 'Title', 'Description', 'Employee ID', 'Employee Name', 'Employee Email',
  'Department', 'Priority', 'Status', 'Start Date', 'Due Date',
  'Created Date', 'Completed Date', 'Overdue',
];

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '');

exports.exportCsv = async (req, res, next) => {
  try {
    const filter = buildTaskFilter(req.query); // may throw 400 before anything is sent
    const sort = buildTaskSort(req.query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.write('\uFEFF' + csvRow(CSV_HEADERS)); // BOM so Excel reads it correctly

    const cursor = Task.find(filter).sort(sort).collation({ locale: 'en' }).lean().cursor();
    for await (const t of cursor) {
      const snap = t.employeeSnapshot || {};
      const employeeDeleted = !t.assignedEmployee;
      res.write(
        csvRow([
          t.taskId,
          t.title,
          t.description,
          snap.employeeId,
          employeeDeleted && snap.fullName ? `${snap.fullName} (deleted)` : snap.fullName,
          snap.email,
          t.department,
          t.priority,
          t.status,
          day(t.startDate),
          day(t.dueDate),
          day(t.createdAt),
          day(t.completedDate),
          taskService.isOverdue(t) ? 'Yes' : 'No',
        ])
      );
    }
    res.end();
  } catch (err) {
    if (res.headersSent) return res.end();
    next(err);
  }
};