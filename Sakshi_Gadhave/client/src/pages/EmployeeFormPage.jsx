import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createEmployee, fetchEmployee, updateEmployee } from '../api/employeeApi';
import { getErrorMessage } from '../api/http';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmployeeForm from '../components/employees/EmployeeForm';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState({ id: null, employee: null, error: '' });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const loading = isEdit && loaded.id !== id;

  useEffect(() => {
    if (!id) return undefined;
    let active = true;

    fetchEmployee(id)
      .then((employee) => {
        if (active) setLoaded({ id, employee, error: '' });
      })
      .catch((err) => {
        if (active) setLoaded({ id, employee: null, error: getErrorMessage(err) });
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError('');
    try {
      if (isEdit) await updateEmployee(id, payload);
      else await createEmployee(payload);
      toast.success(isEdit ? 'Employee updated' : 'Employee added');
      navigate('/employees');
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message); // shown in the red box, like the design
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading employee..." />;

  if (loaded.error) {
    return (
      <section>
        <ErrorState message={loaded.error} />
        <p className="center-text">
          <Link to="/employees" className="btn">
            Back to employees
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="form-card">
        <h1 className="form-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
        <EmployeeForm
          key={id || 'new'}
          initialEmployee={loaded.employee}
          isEdit={isEdit}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}