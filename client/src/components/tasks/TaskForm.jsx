import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../common/FormField';
import { DEPARTMENTS, PRIORITIES } from '../../utils/constants';
import { validateTask } from '../../utils/taskValidators';

const EMPTY_VALUES = {
  title: '',
  assignedEmployee: '',
  department: '',
  priority: '',
  startDate: '',
  dueDate: '',
  description: '',
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const fromTask = (task) => ({
  title: task.title || '',
  assignedEmployee: task.assignedEmployee?._id || '', // empty if the employee was deleted
  department: task.department || '',
  priority: task.priority || '',
  startDate: toDateInput(task.startDate),
  dueDate: toDateInput(task.dueDate),
  description: task.description || '',
});

const buildPayload = (values) => ({
  title: values.title.trim(),
  assignedEmployee: values.assignedEmployee,
  department: values.department,
  priority: values.priority,
  startDate: values.startDate,
  dueDate: values.dueDate,
  description: values.description.trim(),
});

const employeeLabel = (employee) =>
  `${employee.fullName} (${employee.employeeId})${
    employee.status !== 'Active' ? ` - ${employee.status}` : ''
  }`;

export default function TaskForm({ initialTask, employees, isEdit, submitting, serverError, onSubmit }) {
  const [values, setValues] = useState(() => (initialTask ? fromTask(initialTask) : EMPTY_VALUES));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    let next = { ...values, [name]: value };

    // helpful: when an employee is chosen and no department is selected yet, use the employee's department
    if (name === 'assignedEmployee' && !values.department) {
      const chosen = employees.find((employee) => employee._id === value);
      if (chosen) next = { ...next, department: chosen.department };
    }

    setValues(next);
    if (Object.keys(errors).length > 0) setErrors(validateTask(next));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(buildPayload(values));
  };

  const inputClass = (name) => (errors[name] ? 'input input--error' : 'input');
  const selectClass = (name) => (errors[name] ? 'select input--error' : 'select');

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField label="Title" name="title" required error={errors.title}>
          <input
            id="title"
            name="title"
            className={inputClass('title')}
            value={values.title}
            onChange={handleChange}
            placeholder="Enter title"
          />
        </FormField>

        <FormField
          label="Assigned Employee"
          name="assignedEmployee"
          required
          error={errors.assignedEmployee}
          hint={
            initialTask?.employeeDeleted
              ? 'The earlier employee was deleted. Please select a new employee.'
              : undefined
          }
        >
          <select
            id="assignedEmployee"
            name="assignedEmployee"
            className={selectClass('assignedEmployee')}
            value={values.assignedEmployee}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employeeLabel(employee)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Priority" name="priority" required error={errors.priority}>
          <select
            id="priority"
            name="priority"
            className={selectClass('priority')}
            value={values.priority}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Department" name="department" required error={errors.department}>
          <select
            id="department"
            name="department"
            className={selectClass('department')}
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

        <FormField label="Start Date" name="startDate" required error={errors.startDate}>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className={inputClass('startDate')}
            value={values.startDate}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Due Date" name="dueDate" required error={errors.dueDate}>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={inputClass('dueDate')}
            value={values.dueDate}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="Description" name="description" full error={errors.description}>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={500}
            className={`${inputClass('description')} textarea`}
            value={values.description}
            onChange={handleChange}
            placeholder="Enter description"
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
          {submitting ? 'Saving...' : isEdit ? 'Update Task' : 'Submit'}
        </button>
        <Link to="/tasks" className="btn btn--block btn--center">
          Cancel
        </Link>
      </div>
    </form>
  );
}