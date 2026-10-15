// Start of today (UTC). Used everywhere, so "overdue" is the same in list, details, dashboard and CSV.
exports.todayStart = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};