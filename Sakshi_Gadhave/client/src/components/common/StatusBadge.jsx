const toSlug = (text) => text.toLowerCase().replace(/\s+/g, '-');

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${toSlug(status)}`}>{status}</span>;
}