export default function DetailGrid({ items }) {
  return (
    <dl className="detail-grid">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="detail-grid__label">{item.label}</dt>
          <dd className="detail-grid__value">{item.value || '-'}</dd>
        </div>
      ))}
    </dl>
  );
}