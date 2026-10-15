import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchEmployee } from '../api/employeeApi';
import { getErrorMessage } from '../api/http';
import { formatDate } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import DetailGrid from '../components/common/DetailGrid';
import StatusBadge from '../components/common/StatusBadge';

export default function EmployeeViewPage() {
  const { id } = useParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ key: null, employee: null, error: '' });

  const loading = state.key !== `${id}#${reloadKey}`;

  useEffect(() => {
    let active = true;
    const key = `${id}#${reloadKey}`;

    fetchEmployee(id)
      .then((employee) => {
        if (active) setState({ key, employee, error: '' });
      })
      .catch((err) => {
        if (!active) return;
        const message = getErrorMessage(err);
        toast.error(message);
        setState({ key, employee: null, error: message });
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (loading) return <Loader text="Loading employee..." />;

  if (state.error) {
    return (
      <section>
        <ErrorState message={state.error} onRetry={() => setReloadKey((key) => key + 1)} />
        <p className="center-text">
          <Link to="/employees" className="btn">
            Back to employees
          </Link>
        </p>
      </section>
    );
  }

  const employee = state.employee;

  const items = [
    { label: 'Employee ID', value: employee.employeeId },
    { label: 'Full Name', value: employee.fullName },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone },
    { label: 'Department', value: employee.department },
    { label: 'Role', value: employee.role },
    { label: 'Joining Date', value: formatDate(employee.joiningDate) },
    { label: 'Status', value: <StatusBadge status={employee.status} /> },
    { label: 'Skills', value: (employee.skills || []).join(', ') },
    { label: 'Active Tasks (Todo + In Progress)', value: String(employee.activeTaskCount) },
    { label: 'Added On', value: formatDate(employee.createdAt) },
  ];

  if (employee.status === 'On Leave') {
    items.splice(8, 0, {
      label: 'Leave Period',
      value: `${formatDate(employee.leaveStart)} to ${formatDate(employee.leaveEnd)}`,
    });
  }

  return (
    <section>
      <PageHeader title={employee.fullName}>
        <Link to="/employees" className="btn">
          Back
        </Link>
        <Link to={`/employees/${employee._id}/edit`} className="btn btn--primary">
          Edit
        </Link>
      </PageHeader>
      <DetailGrid items={items} />
    </section>
  );
}