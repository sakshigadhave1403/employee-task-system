const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: [true, 'Employee ID is required'], unique: true, trim: true },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 2 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[0-9]{10}$/, 'Phone must be 10 digits'],
    },
    department: {
      type: String,
      enum: { values: DEPARTMENTS, message: 'Invalid department' },
      required: [true, 'Department is required'],
    },
    role: { type: String, required: [true, 'Role is required'], trim: true },
    joiningDate: { type: Date, required: [true, 'Joining date is required'] },
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
    skills: [{ type: String, trim: true }],
    leaveStart: { type: Date },
    leaveEnd: { type: Date },
    activeTaskCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

employeeSchema.pre('validate', function () {
  if (this.status === 'On Leave') {
    if (!this.leaveStart || !this.leaveEnd) {
      throw new AppError(400, 'Leave start and end are required when On Leave');
    }
    if (this.leaveEnd < this.leaveStart) {
      throw new AppError(400, 'Leave end cannot be before leave start');
    }
  } else {
    this.leaveStart = undefined;
    this.leaveEnd = undefined;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
module.exports.DEPARTMENTS = DEPARTMENTS;