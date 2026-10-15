import { formatDate } from '../../utils/format';

export default function DueDate({ date, overdue }) {
  return (
    <span className={overdue ? 'due due--overdue' : 'due'}>
      {formatDate(date)}
      {overdue && ' (Overdue)'}
    </span>
  );
}