import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'fullName:asc', label: 'Name A-Z' },
  { value: 'fullName:desc', label: 'Name Z-A' },
  { value: 'joiningDate:desc', label: 'Joined: latest' },
  { value: 'joiningDate:asc', label: 'Joined: earliest' },
];

const getCurrentSort = (params) => {
  const sortBy = params.sortBy || 'createdAt';
  const order = params.order || (sortBy === 'createdAt' ? 'desc' : 'asc');
  return `${sortBy}:${order}`;
};

export default function EmployeeFilters({ params, hasFilters, onChange, onClear }) {
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
          placeholder="Search name, email or ID"
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
          value={params.status || ''}
          onChange={(event) => onChange({ status: event.target.value })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {EMPLOYEE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={getCurrentSort(params)}
          onChange={handleSortChange}
          aria-label="Sort employees"
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