/**
 * NotFound - 404 page
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = memo(function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Error 404
        </p>
        <h1 className="mt-4 text-5xl font-bold text-white">Page Not Found</h1>
        <p className="mt-4 text-lg text-white/50">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
});

NotFoundPage.displayName = 'NotFoundPage';
