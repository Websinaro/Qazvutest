import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@/src/components/ui/icons';
import { Underline } from '@/src/components/ui/Hand';

export default function NotFoundPage() {
  return (
    <div id="not-found-view" className="relative min-h-[78vh] flex items-center px-4 sm:px-6 py-16 overflow-hidden">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div id="not-found-card" className="md:col-span-7 relative z-10">
          <p className="eyebrow text-chili-600 dark:text-chili-500 mb-5">Error 404</p>
          <h1 className="text-[3.2rem] sm:text-7xl lg:text-[5.6rem] leading-[0.98]">
            That page{' '}
            <span className="relative inline-block">
              wandered off
              <Underline className="text-marigold-400" delay="0.3s" />
            </span>
            .
          </h1>
          <p className="mt-7 max-w-md text-[16px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            The product or page you were after may have been removed, renamed or is taking a break. The rest of the shop is right where you left it.
          </p>

          <Link
            id="not-found-home-link"
            href="/"
            className="group mt-9 inline-flex items-center gap-2 h-12 px-6 rounded-md btn-ink text-[15px] font-semibold"
          >
            Back to the shop
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
          </Link>
        </div>

        {/* A giant, slightly crooked 404 behind a sticker */}
        <div className="md:col-span-5 relative grid place-items-center select-none pointer-events-none" aria-hidden="true">
          <span className="font-display text-[10rem] sm:text-[15rem] leading-none text-ink/[0.08] -rotate-6">404</span>
          <span className="sticker sticker-chili absolute !text-[15px] !px-3 !py-1.5 !rotate-[9deg]">not found</span>
        </div>
      </div>
    </div>
  );
}
