import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="state-box">
      <h1 className="page-title">Page not found</h1>
      <p>This page is not ready yet or the link is wrong.</p>
      <Link to="/" className="btn btn--primary">
        Go to Dashboard
      </Link>
    </div>
  );
}