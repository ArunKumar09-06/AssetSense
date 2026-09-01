import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <EmptyState
        icon={FileQuestion}
        title="404 — Page Not Found"
        description="The page you requested could not be found or has been moved."
        action={
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Home
          </Link>
        }
      />
    </div>
  );
}
