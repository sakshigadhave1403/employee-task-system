export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-box--error">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}