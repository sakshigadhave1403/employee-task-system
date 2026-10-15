import StatusBadge from '../common/StatusBadge';
import RowActions from '../common/RowActions';
import StatusSelect from './StatusSelect';
import DueDate from './DueDate';
import { NEXT_STATUSES } from '../../utils/constants';

export default function TaskTable({ tasks, updatingId, onStatusChange, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="table table--wide">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Employee</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="table__empty">
                No tasks found
              </td>
            </tr>
          )}
          {tasks.map((task) => {
            const employee = task.employeeSnapshot || {};
            const employeeDeleted = !task.assignedEmployee;
            // Completed and Cancelled tasks have no next status, so they cannot be edited
            const canEdit = (NEXT_STATUSES[task.status] || []).length > 0;

            return (
              <tr key={task._id}>
                <td>{task.taskId}</td>
                <td>{task.title}</td>
                <td>
                  {employee.fullName || '-'}
                  {employeeDeleted && employee.fullName && <span className="muted"> (deleted)</span>}
                </td>
                <td>
                  <StatusBadge status={task.priority} />
                </td>
                <td>
                  <StatusSelect
                    status={task.status}
                    disabled={updatingId === task._id}
                    onChange={(nextStatus) => onStatusChange(task, nextStatus)}
                  />
                </td>
                <td>
                  <DueDate date={task.dueDate} overdue={task.isOverdue} />
                </td>
                <td>
                  <RowActions
                    viewTo={`/tasks/${task._id}`}
                    editTo={`/tasks/${task._id}/edit`}
                    canEdit={canEdit}
                    onDelete={() => onDelete(task)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}