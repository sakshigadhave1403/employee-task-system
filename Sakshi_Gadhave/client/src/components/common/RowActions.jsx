import { Link } from 'react-router-dom';

export default function RowActions({ viewTo, editTo, canEdit = true, onDelete }) {
  return (
    <div className="row-actions">
      <Link to={viewTo} className="btn btn--small">
        View
      </Link>
      {canEdit && (
        <Link to={editTo} className="btn btn--small">
          Edit
        </Link>
      )}
      <button type="button" className="btn btn--small btn--danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}