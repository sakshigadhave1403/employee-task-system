export default function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="page-header__actions">{children}</div>
    </div>
  );
}