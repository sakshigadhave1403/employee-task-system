import { DEPARTMENTS, PRIORITIES, TASK_STATUSES } from '../../utils/constants';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date: earliest' },
  { value: 'dueDate:desc', label: 'Due date: latest' },
  { value: 'priority:desc', label: 'Priority: highest first' },
  { value: 'priority:asc', label: 'Priority: lowest first' },
  { value: 'title:asc', label: 'Title A-Z' },
  { value: 'title:desc', label: 'Title Z-A' },
];

const getCurrentSort = (params) => {
  const sortBy = params.sortBy || 'createdAt';
  const defaultOrder = sortBy === 'createdAt' || sortBy === 'priority' ? 'desc' : 'asc';
  return `${sortBy}:${params.order || defaultOrder}`;
};

export default function TaskFilters({ params, hasFilters, onChange, onClear }) {
  const handleSearch = (event) => {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get('search').trim();
    onChange({ search: text });
  };

  const handleSortChange = (event) => {
    const [sortBy, order] = event.target.value.split(':');
    onChange({ sortBy, order });
  };

  return (
    <div className="filters">
      <form
        key={params.search || ''}
        className="toolbar toolbar__search"
        onSubmit={handleSearch}
      >
        <input
          name="search"
          type="search"
          className="input"
          placeholder="Search title or employee"
          defaultValue={params.search || ''}
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      <div className="toolbar">
        <select
          className="select"
          value={params.department || ''}
          onChange={(event) => onChange({ department: event.target.value })}
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={params.priority || ''}
          onChange={(event) => onChange({ priority: event.target.value })}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={params.status || ''}
          onChange={(event) => onChange({ status: event.target.value })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar toolbar--center">
        <label className="filter-date">
          <span>Due from</span>
          <input
            type="date"
            className="input"
            value={params.dueFrom || ''}
            onChange={(event) => onChange({ dueFrom: event.target.value })}
          />
        </label>

        <label className="filter-date">
          <span>Due to</span>
          <input
            type="date"
            className="input"
            value={params.dueTo || ''}
            onChange={(event) => onChange({ dueTo: event.target.value })}
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={params.overdue === 'true'}
            onChange={(event) => onChange({ overdue: event.target.checked ? 'true' : '' })}
          />
          Overdue only
        </label>

        <select
          className="select"
          value={getCurrentSort(params)}
          onChange={handleSortChange}
          aria-label="Sort tasks"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button type="button" className="btn" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}