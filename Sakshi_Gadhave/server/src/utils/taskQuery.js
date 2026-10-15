const AppError = require('./AppError');
const escapeRegex = require('./escapeRegex');
const { todayStart } = require('./dateUtils');

const parseDate = (value, label) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new AppError(400, `Invalid ${label}`);
  return d;
};

exports.buildTaskFilter = (q) => {
  const filter = {};

  if (q.search && q.search.trim()) {
    const rx = new RegExp(escapeRegex(q.search.trim()), 'i');
    filter.$or = [{ title: rx }, { 'employeeSnapshot.fullName': rx }];
  }
  if (q.department) filter.department = q.department;
  if (q.priority) filter.priority = q.priority;
  if (q.status) filter.status = q.status;

  if (q.dueFrom || q.dueTo) {
    filter.dueDate = {};
    if (q.dueFrom) filter.dueDate.$gte = parseDate(q.dueFrom, 'due from date');
    if (q.dueTo) filter.dueDate.$lte = parseDate(q.dueTo, 'due to date');
  }

  if (q.overdue === 'true') {
    filter.$and = [
      { status: { $in: ['Todo', 'In Progress'] } },
      { dueDate: { $lt: todayStart() } },
    ];
  }
  return filter;
};

const SORT_FIELDS = {
  createdAt: 'createdAt',
  dueDate: 'dueDate',
  priority: 'priorityRank', // Critical > High > Medium > Low
  title: 'title',
};

exports.buildTaskSort = (q) => {
  const key = SORT_FIELDS[q.sortBy] ? q.sortBy : 'createdAt';
  const defaultDir = key === 'createdAt' || key === 'priority' ? -1 : 1;
  const dir = q.order ? (q.order === 'asc' ? 1 : -1) : defaultDir;
  return { [SORT_FIELDS[key]]: dir, _id: 1 };
};