const mongoose = require('mongoose');

const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, unique: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3 },
    description: { type: String, trim: true, default: '' },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    employeeSnapshot: {
      employeeId: String,
      fullName: String,
      email: String,
    },
    department: {
      type: String,
      enum: ['Development', 'Design', 'QA', 'HR', 'Sales'],
      required: [true, 'Department is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: [true, 'Priority is required'],
    },
    priorityRank: { type: Number },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Todo',
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    completedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.pre('validate', function () {
  this.priorityRank = PRIORITY_RANK[this.priority];
});

taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedEmployee: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);