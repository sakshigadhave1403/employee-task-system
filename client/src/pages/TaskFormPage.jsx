import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTask, fetchTask, updateTask } from '../api/taskApi';
import { fetchEmployeeOptions } from '../api/employeeApi';
import { getErrorMessage } from '../api/http';
import { NEXT_STATUSES } from '../utils/constants';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import TaskForm from '../components/tasks/TaskForm';

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState({ key: null, employees: [], task: null, error: '' });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const pageKey = id || 'new';
  const loading = loaded.key !== pageKey;

  useEffect(() => {
    let active = true;
    const key = id || 'new';

    Promise.all([fetchEmployeeOptions(), id ? fetchTask(id) : Promise.resolve(null)])
      .then(([employees, task]) => {
        if (active) setLoaded({ key, employees, task, error: '' });
      })
      .catch((err) => {
        if (active) setLoaded({ key, employees: [], task: null, error: getErrorMessage(err) });
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError('');
    try {
      if (isEdit) await updateTask(id, payload);
      else await createTask(payload);
      toast.success(isEdit ? 'Task updated' : 'Task added');
      navigate('/tasks');
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message); // business rule errors show in the red box, like the design
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  if (loaded.error) {
    return (
      <section>
        <ErrorState message={loaded.error} />
        <p className="center-text">
          <Link to="/tasks" className="btn">
            Back to tasks
          </Link>
        </p>
      </section>
    );
  }

  const task = loaded.task;
  const isFinal = task && (NEXT_STATUSES[task.status] || []).length === 0;

  if (isEdit && isFinal) {
    return (
      <section>
        <div className="state-box">
          <h1 className="page-title">Cannot edit this task</h1>
          <p>{task.status} tasks cannot be edited.</p>
          <Link to={`/tasks/${id}`} className="btn btn--primary">
            View task
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="form-card">
        <h1 className="form-title">{isEdit ? 'Edit Task' : 'Add Task'}</h1>
        <TaskForm
          key={pageKey}
          initialTask={task}
          employees={loaded.employees}
          isEdit={isEdit}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}