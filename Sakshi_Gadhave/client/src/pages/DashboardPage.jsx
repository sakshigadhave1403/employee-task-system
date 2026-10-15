import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchDashboard } from '../api/dashboardApi';
import { getErrorMessage } from '../api/http';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import StatCard from '../components/common/StatCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchDashboard()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError('');
      })
      .catch((err) => {
        if (!active) return;
        const message = getErrorMessage(err);
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;

  const { employees, tasks, workload } = data;

  return (
    <section>
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total Employees" value={employees.total} />
        <StatCard label="Active" value={employees.active} tone="green" />
        <StatCard label="Inactive" value={employees.inactive} tone="gray" />
        <StatCard label="On Leave" value={employees.onLeave} tone="amber" />
      </div>

      <div className="stat-grid stat-grid--spaced">
        <StatCard label="Total Tasks" value={tasks.total} />
        <StatCard label="Todo" value={tasks.todo} tone="gray" />
        <StatCard label="In Progress" value={tasks.inProgress} tone="blue" />
        <StatCard label="Completed" value={tasks.completed} tone="green" />
        <StatCard label="Cancelled" value={tasks.cancelled} tone="brown" />
        <StatCard label="Overdue" value={tasks.overdue} tone="red" />
      </div>

      <h2 className="section-title">Employee Workload</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Active Tasks</th>
            </tr>
          </thead>
          <tbody>
            {workload.length === 0 && (
              <tr>
                <td colSpan={4} className="table__empty">
                  No employees yet
                </td>
              </tr>
            )}
            {workload.map((row) => (
              <tr key={row._id}>
                <td>{row.fullName}</td>
                <td>{row.department}</td>
                <td>{row.status}</td>
                <td>{row.activeTasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}