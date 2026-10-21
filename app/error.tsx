'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from '@/src/components/ui/icons';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error:', error);
  }, [error]);

  return (
    <div id="error-boundary-view" className="min-h-[78vh] flex items-center px-4 sm:px-6 py-16">
      <div id="error-card" className="max-w-2xl w-full mx-auto">
        <p className="note text-chili-600 dark:text-chili-500 text-[1.8rem] -rotate-2 mb-2">oops.</p>
        <h2 className="text-[2.8rem] sm:text-6xl leading-[1]">Something snapped on our side.</h2>
        <p className="mt-6 text-[16px] leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-lg">
          {error?.message || 'An unexpected error stopped this page from loading. Trying again usually does the trick.'}
        </p>

        <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            id="retry-btn"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md btn-ink text-[15px] font-semibold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            id="error-home-link"
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border-[1.5px] border-ink text-[15px] font-semibold hover:bg-ink hover:text-paper transition-colors"
          >
            <Home className="w-4 h-4" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
