import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../common/FormField';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants';
import { validateEmployee, parseSkills } from '../../utils/validators';

const EMPTY_VALUES = {
  employeeId: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  joiningDate: '',
  status: 'Active',
  skills: '',
  leaveStart: '',
  leaveEnd: '',
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const fromEmployee = (employee) => ({
  employeeId: employee.employeeId || '',
  fullName: employee.fullName || '',
  email: employee.email || '',
  phone: employee.phone || '',
  department: employee.department || '',
  role: employee.role || '',
  joiningDate: toDateInput(employee.joiningDate),
  status: employee.status || 'Active',
  skills: (employee.skills || []).join(', '),
  leaveStart: toDateInput(employee.leaveStart),
  leaveEnd: toDateInput(employee.leaveEnd),
});

const buildPayload = (values) => {
  const payload = {
    employeeId: values.employeeId.trim(),
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    department: values.department,
    role: values.role.trim(),
    joiningDate: values.joiningDate,
    status: values.status,
    skills: parseSkills(values.skills),
  };
  if (values.status === 'On Leave') {
    payload.leaveStart = values.leaveStart;
    payload.leaveEnd = values.leaveEnd;
  }
  return payload;
};

export default function EmployeeForm({ initialEmployee, isEdit, submitting, serverError, onSubmit }) {
  const [values, setValues] = useState(() =>
    initialEmployee ? fromEmployee(initialEmployee) : EMPTY_VALUES
  );
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // after the first failed submit, keep the messages up to date while typing
    if (Object.keys(errors).length > 0) setErrors(validateEmployee(next));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateEmployee(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(buildPayload(values));
  };

  const inputClass = (name) => (errors[name] ? 'input input--error' : 'input');

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField label="Employee ID" name="employeeId" required error={errors.employeeId}>
          <input
            id="employeeId"
            name="employeeId"
            className={inputClass('employeeId')}
            value={values.employeeId}
            onChange={handleChange}
            disabled={isEdit}
            placeholder="EMP001"
          />
        </FormField>

        <FormField label="Full Name" name="fullName" required error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            className={inputClass('fullName')}
            value={values.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </FormField>

        <FormField label="Email" name="email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            className={inputClass('email')}
            value={values.email}
            onChange={handleChange}
            placeholder="name@company.com"
          />
        </FormField>

        <FormField label="Phone" name="phone" required error={errors.phone}>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            maxLength={10}
            className={inputClass('phone')}
            value={values.phone}
            onChange={handleChange}
            placeholder="10 digit number"
          />
        </FormField>

        <FormField label="Department" name="department" required error={errors.department}>
          <select
            id="department"
            name="department"
            className={errors.department ? 'select input--error' : 'select'}
            value={values.department}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Role" name="role" required error={errors.role}>
          <input
            id="role"
            name="role"
            className={inputClass('role')}
            value={values.role}
            onChange={handleChange}
            placeholder="Backend Developer"
          />
        </FormField>

        <FormField label="Joining Date" name="joiningDate" required error={errors.joiningDate}>
          <input
            id="joiningDate"
            name="joiningDate"
            type="date"
            className={inputClass('joiningDate')}
            value={values.joiningDate}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Status" name="status" required error={errors.status}>
          <select
            id="status"
            name="status"
            className={errors.status ? 'select input--error' : 'select'}
            value={values.status}
            onChange={handleChange}
          >
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>

        {values.status === 'On Leave' && (
          <>
            <FormField label="Leave Start" name="leaveStart" required error={errors.leaveStart}>
              <input
                id="leaveStart"
                name="leaveStart"
                type="date"
                className={inputClass('leaveStart')}
                value={values.leaveStart}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Leave End" name="leaveEnd" required error={errors.leaveEnd}>
              <input
                id="leaveEnd"
                name="leaveEnd"
                type="date"
                className={inputClass('leaveEnd')}
                value={values.leaveEnd}
                onChange={handleChange}
              />
            </FormField>
          </>
        )}

        <FormField
          label="Skills"
          name="skills"
          full
          error={errors.skills}
          hint="Separate skills with commas, for example: Node.js, MongoDB"
        >
          <input
            id="skills"
            name="skills"
            className={inputClass('skills')}
            value={values.skills}
            onChange={handleChange}
            placeholder="Node.js, React"
          />
        </FormField>
      </div>

      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Submit'}
        </button>
        <Link to="/employees" className="btn btn--block btn--center">
          Cancel
        </Link>
      </div>
    </form>
  );
}