import StatusBadge from '../common/StatusBadge';
import RowActions from '../common/RowActions';

export default function EmployeeTable({ employees, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="table table--wide">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && (
            <tr>
              <td colSpan={7} className="table__empty">
                No employees found
              </td>
            </tr>
          )}
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.employeeId}</td>
              <td>{employee.fullName}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>
                <StatusBadge status={employee.status} />
              </td>
              <td>
                <RowActions
                  viewTo={`/employees/${employee._id}`}
                  editTo={`/employees/${employee._id}/edit`}
                  onDelete={() => onDelete(employee)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}