export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__spinner" />
      <span>{text}</span>
    </div>
  );
}