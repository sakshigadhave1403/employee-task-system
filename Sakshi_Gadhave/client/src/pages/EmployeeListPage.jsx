import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchEmployees, deleteEmployee } from '../api/employeeApi';
import { getErrorMessage } from '../api/http';
import useListParams from '../hooks/useListParams';
import { PAGE_SIZE } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';

const FILTER_KEYS = ['search', 'department', 'status'];

export default function EmployeeListPage() {
  const { params, page, queryKey, updateParams, clearParams } = useListParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], pagination: null, error: '' });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loading = result.key !== `${queryKey}#${reloadKey}`;
  const hasFilters = FILTER_KEYS.some((key) => params[key]);

  useEffect(() => {
    let active = true;
    const key = `${queryKey}#${reloadKey}`;
    const query = { ...Object.fromEntries(new URLSearchParams(queryKey)), limit: PAGE_SIZE };

    fetchEmployees(query)
      .then((response) => {
        if (!active) return;
        setResult({ key, data: response.data, pagination: response.pagination, error: '' });
      })
      .catch((err) => {
        if (!active) return;
        const message = getErrorMessage(err);
        toast.error(message);
        setResult({ key, data: [], pagination: null, error: message });
      });

    return () => {
      active = false;
    };
  }, [queryKey, reloadKey]);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete._id);
      toast.success('Employee deleted');
      setToDelete(null);
      // deleted the last row of a later page: go one page back
      if (result.data.length === 1 && page > 1) updateParams({ page: page - 1 });
      else setReloadKey((key) => key + 1);
    } catch (err) {
      toast.error(getErrorMessage(err)); // for example: "Cannot delete employee with 3 active task(s)..."
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <PageHeader title="Employees">
        <Link to="/employees/new" className="btn btn--primary">
          + Add Employee
        </Link>
      </PageHeader>

      <EmployeeFilters
        params={params}
        hasFilters={hasFilters}
        onChange={updateParams}
        onClear={clearParams}
      />

      {loading && <Loader text="Loading employees..." />}

      {!loading && result.error && (
        <ErrorState message={result.error} onRetry={() => setReloadKey((key) => key + 1)} />
      )}

      {!loading && !result.error && (
        <>
          <EmployeeTable employees={result.data} onDelete={setToDelete} />
          {result.pagination && (
            <Pagination
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              total={result.pagination.total}
              limit={result.pagination.limit}
              itemLabel="employees"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete employee?"
          message={`Delete ${toDelete.fullName} (${toDelete.employeeId})? This cannot be undone.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}