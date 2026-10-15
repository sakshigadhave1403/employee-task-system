import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchTasks, deleteTask, updateTaskStatus, downloadTasksCsv } from '../api/taskApi';
import { getErrorMessage } from '../api/http';
import useListParams from '../hooks/useListParams';
import { PAGE_SIZE } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskTable from '../components/tasks/TaskTable';

const FILTER_KEYS = ['search', 'department', 'priority', 'status', 'dueFrom', 'dueTo', 'overdue'];
const FINAL_STATUSES = ['Completed', 'Cancelled'];

export default function TaskListPage() {
  const { params, page, queryKey, updateParams, clearParams } = useListParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], pagination: null, error: '' });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // { task, status }
  const [updatingId, setUpdatingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loading = result.key !== `${queryKey}#${reloadKey}`;
  const hasFilters = FILTER_KEYS.some((key) => params[key]);

  useEffect(() => {
    let active = true;
    const key = `${queryKey}#${reloadKey}`;
    const query = { ...Object.fromEntries(new URLSearchParams(queryKey)), limit: PAGE_SIZE };

    fetchTasks(query)
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

  const reload = () => setReloadKey((key) => key + 1);

  /* ---------- status change ---------- */
  const runStatusChange = async (task, status) => {
    setUpdatingId(task._id);
    try {
      await updateTaskStatus(task._id, status);
      toast.success(`${task.taskId} is now ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err)); // for example: "Cannot change status from Todo to Completed"
    } finally {
      setUpdatingId(null);
      setPendingStatus(null);
      reload(); // refresh in both cases, the data may be outdated
    }
  };

  const handleStatusChange = (task, status) => {
    // Completed and Cancelled are final, so we ask first
    if (FINAL_STATUSES.includes(status)) setPendingStatus({ task, status });
    else runStatusChange(task, status);
  };

  /* ---------- delete ---------- */
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(toDelete._id);
      toast.success('Task deleted');
      setToDelete(null);
      if (result.data.length === 1 && page > 1) updateParams({ page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- export (all rows matching the current filters, not only this page) ---------- */
  const handleExport = async () => {
    setExporting(true);
    try {
      const filters = { ...params };
      delete filters.page;
      await downloadTasksCsv(filters);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <section>
      <PageHeader title="Tasks">
        <button type="button" className="btn" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export To CSV'}
        </button>
        <Link to="/tasks/new" className="btn btn--primary">
          + Add Task
        </Link>
      </PageHeader>

      <TaskFilters
        params={params}
        hasFilters={hasFilters}
        onChange={updateParams}
        onClear={clearParams}
      />

      {loading && <Loader text="Loading tasks..." />}

      {!loading && result.error && <ErrorState message={result.error} onRetry={reload} />}

      {!loading && !result.error && (
        <>
          <TaskTable
            tasks={result.data}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onDelete={setToDelete}
          />
          {result.pagination && (
            <Pagination
              page={result.pagination.page}
              totalPages={result.pagination.totalPages}
              total={result.pagination.total}
              limit={result.pagination.limit}
              itemLabel="tasks"
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
            />
          )}
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`Delete ${toDelete.taskId} - ${toDelete.title}? This cannot be undone.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {pendingStatus && (
        <ConfirmDialog
          title={`Mark as ${pendingStatus.status}?`}
          message={`${pendingStatus.task.taskId} will become ${pendingStatus.status}. Completed and Cancelled tasks cannot be edited or changed again.`}
          confirmText="Yes, change"
          loading={updatingId !== null}
          onConfirm={() => runStatusChange(pendingStatus.task, pendingStatus.status)}
          onCancel={() => setPendingStatus(null)}
        />
      )}
    </section>
  );
}