import React from 'react';

/**
 * Small hand-drawn marks. They're plain SVG paths with an uneven stroke so the
 * page doesn't read as perfectly machine-ruled. `pathLength={1}` lets the
 * `scribble` utility in globals.css draw them in once.
 */

/** A loose underline to sit beneath a word (wrap the word in `relative inline-block`). */
export function Underline({
  className = '',
  animate = true,
  delay,
}: {
  className?: string;
  animate?: boolean;
  delay?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      fill="none"
      className={`absolute left-0 -bottom-[0.14em] w-full h-[0.3em] pointer-events-none overflow-visible ${className}`}
    >
      <path
        d="M2 9.5C28 4.5 52 4 78 7c26 3 51 2.5 76-.8 23-3 41-2.4 64 1.6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        pathLength={1}
        className={animate ? 'scribble' : undefined}
        style={delay ? ({ '--d': delay } as React.CSSProperties) : undefined}
      />
    </svg>
  );
}

/** A looping circle, like someone ringed a price with a pen. */
export function Ring({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 60" fill="none" className={`pointer-events-none overflow-visible ${className}`}>
      <path
        d="M104 14C92 5 62 2 38 8 14 14 4 28 10 40c6 12 34 16 60 12 28-4 44-18 40-32-2-7-9-12-18-14"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        pathLength={1}
        className="scribble"
        style={{ '--d': '1.1s' } as React.CSSProperties}
      />
    </svg>
  );
}

/** A wobbly arrow, for margin notes. Points right by default. */
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 40" fill="none" className={`pointer-events-none overflow-visible ${className}`}>
      <path
        d="M3 28C18 10 40 6 70 14M70 14 58 6M70 14 60 25"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hand-ticked check mark, used instead of icon-in-a-circle bullets. */
export function Tick({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 11.5 8 16 17.5 4.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
