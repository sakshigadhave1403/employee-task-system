import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchTask } from '../api/taskApi';
import { getErrorMessage } from '../api/http';
import { formatDate } from '../utils/format';
import { NEXT_STATUSES } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import DetailGrid from '../components/common/DetailGrid';
import StatusBadge from '../components/common/StatusBadge';
import DueDate from '../components/tasks/DueDate';

export default function TaskViewPage() {
  const { id } = useParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ key: null, task: null, error: '' });

  const loading = state.key !== `${id}#${reloadKey}`;

  useEffect(() => {
    let active = true;
    const key = `${id}#${reloadKey}`;

    fetchTask(id)
      .then((task) => {
        if (active) setState({ key, task, error: '' });
      })
      .catch((err) => {
        if (!active) return;
        const message = getErrorMessage(err);
        toast.error(message);
        setState({ key, task: null, error: message });
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (loading) return <Loader text="Loading task..." />;

  if (state.error) {
    return (
      <section>
        <ErrorState message={state.error} onRetry={() => setReloadKey((key) => key + 1)} />
        <p className="center-text">
          <Link to="/tasks" className="btn">
            Back to tasks
          </Link>
        </p>
      </section>
    );
  }

  const task = state.task;
  const snapshot = task.employeeSnapshot || {};
  const employee = task.assignedEmployee;
  const canEdit = (NEXT_STATUSES[task.status] || []).length > 0;

  // if the employee was deleted, we still show the saved name and ID
  const employeeValue = task.employeeDeleted ? (
    <span>
      {snapshot.fullName || 'Unknown'} ({snapshot.employeeId || '-'}) <span className="muted">- employee deleted</span>
    </span>
  ) : (
    <Link to={`/employees/${employee._id}`}>
      {employee.fullName} ({employee.employeeId})
    </Link>
  );

  const items = [
    { label: 'Task ID', value: task.taskId },
    { label: 'Title', value: task.title },
    { label: 'Assigned Employee', value: employeeValue },
    { label: 'Employee Email', value: task.employeeDeleted ? snapshot.email : employee.email },
    { label: 'Department', value: task.department },
    { label: 'Priority', value: <StatusBadge status={task.priority} /> },
    { label: 'Status', value: <StatusBadge status={task.status} /> },
    { label: 'Start Date', value: formatDate(task.startDate) },
    { label: 'Due Date', value: <DueDate date={task.dueDate} overdue={task.isOverdue} /> },
    { label: 'Created Date', value: formatDate(task.createdAt) },
    { label: 'Completed Date', value: task.completedDate ? formatDate(task.completedDate) : '' },
    { label: 'Description', value: task.description },
  ];

  return (
    <section>
      <PageHeader title={task.title}>
        <Link to="/tasks" className="btn">
          Back
        </Link>
        {canEdit && (
          <Link to={`/tasks/${task._id}/edit`} className="btn btn--primary">
            Edit
          </Link>
        )}
      </PageHeader>
      <DetailGrid items={items} />
    </section>
  );
}