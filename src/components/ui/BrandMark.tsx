import React from 'react';

/**
 * QazvuCart mark: a luggage-tag with a leaf-check on it, hung at a slight angle.
 * Flat, one colour, no gradient.
 */
export function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-[6px] rounded-tl-[14px] bg-brand-800 text-brand-50 dark:bg-brand-300 dark:text-brand-950 -rotate-6 shrink-0 ${className}`}
    >
      {/* the punched hole */}
      <span aria-hidden="true" className="absolute top-[11%] left-[11%] size-[14%] rounded-full bg-paper" />
      <svg viewBox="0 0 64 64" className="w-[62%] h-[62%] translate-x-[6%] translate-y-[6%]" fill="none" aria-hidden="true">
        <path d="M10 34c0-13 10-22 26-24 0 15-8 26-22 28-2 .3-4-1-4-4Z" fill="currentColor" opacity="0.92" />
        <path
          d="M22 38 L32 48 L54 18"
          stroke="var(--color-marigold-300)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Wordmark: "Qazvu" in the serif, "Cart" in leaf green with a tick of marigold. */
export function Wordmark({ className = 'text-[1.6rem]' }: { className?: string }) {
  return (
    <span className={`font-display leading-none tracking-[-0.01em] ${className}`}>
      Qazvu<span className="text-brand-700 dark:text-brand-300">Cart</span>
    </span>
  );
}
