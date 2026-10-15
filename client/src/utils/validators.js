import { EMPLOYEE_STATUSES } from './constants';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const ID_REGEX = /^[A-Za-z0-9-]+$/;

export const parseSkills = (text) =>
  text
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

export const validateEmployee = (values) => {
  const errors = {};

  const employeeId = values.employeeId.trim();
  if (!employeeId) errors.employeeId = 'Employee ID is required';
  else if (!ID_REGEX.test(employeeId)) errors.employeeId = 'Use only letters, numbers and hyphen';
  else if (employeeId.length > 20) errors.employeeId = 'Employee ID can be at most 20 characters';

  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = 'Full name is required';
  else if (fullName.length < 2) errors.fullName = 'Name must be at least 2 characters';
  else if (fullName.length > 60) errors.fullName = 'Name can be at most 60 characters';

  const email = values.email.trim();
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';

  const phone = values.phone.trim();
  if (!phone) errors.phone = 'Phone is required';
  else if (!PHONE_REGEX.test(phone)) errors.phone = 'Phone must be exactly 10 digits';

  if (!values.department) errors.department = 'Select a department';

  const role = values.role.trim();
  if (!role) errors.role = 'Role is required';
  else if (role.length < 2) errors.role = 'Role must be at least 2 characters';

  if (!values.joiningDate) errors.joiningDate = 'Joining date is required';

  if (!EMPLOYEE_STATUSES.includes(values.status)) errors.status = 'Select a status';

  if (values.status === 'On Leave') {
    if (!values.leaveStart) errors.leaveStart = 'Leave start date is required';
    if (!values.leaveEnd) errors.leaveEnd = 'Leave end date is required';
    if (values.leaveStart && values.leaveEnd && values.leaveEnd < values.leaveStart) {
      errors.leaveEnd = 'Leave end cannot be before leave start';
    }
  }

  const skills = parseSkills(values.skills);
  if (skills.length > 10) errors.skills = 'Add at most 10 skills';
  else if (skills.some((skill) => skill.length > 30)) {
    errors.skills = 'Each skill can be at most 30 characters';
  }

  return errors;
};