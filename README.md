# Employee & Task Management System

MERN stack assignment for Roots Media Marketing.
A company can manage employees, assign tasks to them, and see a dashboard.
All business rules are enforced on the back-end.

## Live links

## Live links

- Frontend: https://employee-task-system-eight.vercel.app
- Backend: https://employee-task-system-dvf7.onrender.com
- Health check: https://employee-task-system-dvf7.onrender.com/api/health
- Code: https://github.com/sakshigadhave1403/employee-task-system

Note: the backend is on a free plan and sleeps when nobody uses it.
The first request can take up to a minute.

## Tech stack

- Front-end: React (Vite), React Router, Axios, react-hot-toast, plain CSS
- Back-end: Node.js, Express
- Database: MongoDB with Mongoose (MongoDB Atlas)

## Folder structure

```
employee-task-system/
  server/
    src/
      config/        (reserved)
      controllers/   request handlers (employee, task, dashboard)
      middleware/    error handler
      models/        Employee, Task, Counter
      routes/        route files
      services/      task business rules
      utils/         helpers (pagination, filters, csv, dates)
      app.js
      server.js
  client/
    src/
      api/           Axios calls
      components/    layout, common, employees, tasks
      hooks/         useListParams (URL state)
      pages/         Dashboard, Employee and Task pages
      styles/        app.css
      utils/         constants, validators, formatters
```

## Setup

Requirements: Node.js 18 or newer, and a MongoDB Atlas database.

Back-end:

```
cd server
npm install
copy .env.example .env     (then fill in the values)
npm run dev
```

Front-end (in another terminal):

```
cd client
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment variables

server/.env

| Name       | Meaning                                             |
| ---------- | --------------------------------------------------- |
| PORT       | Port for the API (default 5000)                     |
| MONGO_URI  | MongoDB Atlas connection string                     |
| CLIENT_URL | Front-end URL allowed by CORS (no slash at the end) |

client/.env

| Name         | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| VITE_API_URL | Back-end API URL, for example http://localhost:5000/api |

No password or secret is committed. Only `.env.example` files are in the repository.

## API overview

All responses are JSON: `{ success, data, pagination? }` or `{ success: false, message }`.

Employees

| Method | URL                    | Purpose                                            |
| ------ | ---------------------- | -------------------------------------------------- |
| GET    | /api/employees         | List with search, filters, sort, pagination        |
| GET    | /api/employees/options | Small list for the task form dropdown              |
| GET    | /api/employees/:id     | View one                                           |
| POST   | /api/employees         | Add                                                |
| PUT    | /api/employees/:id     | Edit                                               |
| DELETE | /api/employees/:id     | Delete (blocked if Todo / In Progress tasks exist) |

Tasks

| Method | URL                   | Purpose                                               |
| ------ | --------------------- | ----------------------------------------------------- |
| GET    | /api/tasks            | List with search, filters, sort, pagination           |
| GET    | /api/tasks/export     | CSV of all tasks matching the filters (no pagination) |
| GET    | /api/tasks/:id        | View one                                              |
| POST   | /api/tasks            | Add (always starts as Todo)                           |
| PUT    | /api/tasks/:id        | Edit (status is ignored)                              |
| PUT    | /api/tasks/:id/status | Change status (the only way to change it)             |
| DELETE | /api/tasks/:id        | Delete                                                |

Dashboard

| Method | URL            | Purpose                                         |
| ------ | -------------- | ----------------------------------------------- |
| GET    | /api/dashboard | Employee counts, task counts, overdue, workload |

Query parameters

- Both lists: `search`, `department`, `status`, `sortBy`, `order` (asc or desc), `page`, `limit`
- Tasks only: `priority`, `dueFrom`, `dueTo`, `overdue=true`
- Task `sortBy`: createdAt, dueDate, priority (by importance), title
- Employee `sortBy`: createdAt, fullName, joiningDate, department

Errors: 400 invalid data or broken rule, 404 not found, 409 duplicate employee ID or email.

## Schema and Employee to Task relationship

Employee: employeeId (unique), fullName, email (unique, lowercase), phone, department, role,
joiningDate, status (Active / Inactive / On Leave), skills, leaveStart and leaveEnd
(only when On Leave), activeTaskCount.

Task: taskId (auto, TSK-001), title, description, assignedEmployee (reference to Employee),
employeeSnapshot (employeeId, fullName, email), department, priority, priorityRank, status,
startDate, dueDate, createdAt (Created Date), completedDate.

Relationship: one Employee has many Tasks. Task.assignedEmployee points to the Employee.
`priorityRank` (Low 1 to Critical 4) lets the database sort by importance.
`activeTaskCount` on the employee counts Todo and In Progress tasks, and is used for the capacity rule.

## How employee deletion is handled

- An employee with Todo or In Progress tasks cannot be deleted (400 with a clear message).
- When an employee is deleted, their old tasks stay. The link (assignedEmployee) is set to null,
  but `employeeSnapshot` keeps the name, employee ID and email.
- The task list, details page and CSV still show the employee name, marked as "(deleted)".

## Business rules and where they run

All rules run in the back-end (task.service.js and the models). The front-end repeats the
simple checks only to give faster feedback.

- Assignment: only Active employees; On Leave employees are rejected only if the task start date is in the leave period (both dates inclusive).
- Due date cannot be earlier than start date.
- Status flow: Todo to In Progress to Completed, and Todo or In Progress to Cancelled. Anything else is rejected.
- Completed and Cancelled tasks cannot be edited.
- Completed date is set by the server.
- Capacity: at most 3 active tasks (Todo + In Progress) per employee.
- Overdue: due date is before today and status is not Completed or Cancelled. The same helper is used for the list, details, dashboard and CSV.

## Assumptions

- Employee ID is typed by the admin and cannot be changed after creation.
- Dates are plain dates in UTC. A task due today is not overdue; it is overdue from the next day.
- Making an employee Inactive or On Leave does not remove their existing tasks. The rules apply to new assignments.
- On task edit, the assignment rules run again only when the employee or the start date changes.
- A task has its own department, chosen in the form (the form suggests the employee's department).
- Employee search covers name, email and ID. Task search covers title and the employee name saved on the task.
- Page size is 10. The status of a task can only be changed through the status API.
- No login, as required.

## Questions

1. Where do you validate status transitions and why?
   In the back-end, in `updateStatus` (server/src/services/task.service.js), using a map of allowed
   next statuses. The front-end dropdown only shows valid options for convenience, but anyone can
   send a request directly (Postman, edited requests), so only the server can be trusted. The normal
   edit API ignores the status field, so there is one single way to change it.

2. Why does Completed Date come from the back-end?
   The client's clock or timezone can be wrong, and a client could send any date. The server sets it
   at the exact moment the status becomes Completed, so the value is trustworthy. The edit API ignores it.

3. How do you block inactive / on-leave assignment?
   `checkEmployeeCanTakeTask` runs when a task is created, and when its employee or start date is
   edited. An Inactive employee is always rejected (400). An On Leave employee is rejected (400) only
   if the task start date is between leaveStart and leaveEnd, both inclusive.

4. Why are filtering and pagination on the back-end?
   The database can hold thousands of records. Sending all of them to the browser is slow and wasteful.
   With server-side filtering, search, filters and sorting work together on the whole data set (not
   only the visible page), the total count is correct, and the CSV export can use exactly the same filter.

5. Why do filters live in the URL?
   A refresh, a copied link, a bookmark and the browser back button all show the same view. The URL
   is the single source of truth for search, filters, sort and page.

6. What can go wrong if two requests assign a 4th active task at the same time?
   With "count the tasks, then create", both requests can read a count of 2, both pass the check, and
   both create a task, so the employee ends up with 4 active tasks. To prevent this, a slot is
   reserved with one atomic update: `findOneAndUpdate({ _id, activeTaskCount: { $lt: 3 } }, { $inc: { activeTaskCount: 1 } })`.
   MongoDB applies this on one document atomically, so only one request can take the last slot.
   The slot is released when a task is completed, cancelled, deleted or moved to another employee.
   Limitation: if the server crashes between reserving the slot and creating the task, the counter
   can be off by one. A production system could use transactions or a periodic recount.
