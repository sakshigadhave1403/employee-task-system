import { NEXT_STATUSES } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';

const toSlug = (text) => text.toLowerCase().replace(/\s+/g, '-');

export default function StatusSelect({ status, disabled = false, onChange }) {
  const nextStatuses = NEXT_STATUSES[status] || [];

  if (nextStatuses.length === 0) return <StatusBadge status={status} />;

  return (
    <select
      className={`status-select status-select--${toSlug(status)}`}
      value={status}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`Change status from ${status}`}
    >
      <option value={status}>{status}</option>
      {nextStatuses.map((next) => (
        <option key={next} value={next}>
          {next}
        </option>
      ))}
    </select>
  );
}