export const validateTask = (values) => {
  const errors = {};

  const title = values.title.trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.length > 100) errors.title = 'Title can be at most 100 characters';

  if (!values.assignedEmployee) errors.assignedEmployee = 'Select an employee';
  if (!values.department) errors.department = 'Select a department';
  if (!values.priority) errors.priority = 'Select a priority';
  if (!values.startDate) errors.startDate = 'Start date is required';
  if (!values.dueDate) errors.dueDate = 'Due date is required';

  if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
    errors.dueDate = 'Due date cannot be earlier than start date';
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description can be at most 500 characters';
  }

  return errors;
};