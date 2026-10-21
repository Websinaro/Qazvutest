'use client';

import React from 'react';
import { LayoutGroup, motion, useReducedMotion, type Variants } from 'motion/react';

/**
 * Entrance for product / category grids.
 *
 *  - Cells fade up a short distance, one after another, as the grid scrolls
 *    into view (once). No bounce, no scale: it should feel like pages being
 *    turned, not like a toy.
 *  - `layout="position"` lets cells glide to their new spot when the grid
 *    reflows (e.g. switching 2 / 3 / 4 columns) instead of snapping.
 *  - Changing `resetKey` (page, filters, sort) replays the entrance.
 *  - Honours prefers-reduced-motion by rendering a plain grid.
 *
 * Deliberately no `filter` / persistent transforms: those create a
 * containing block that would break `position: fixed` descendants.
 */

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Seconds before the first child starts. */
  delay?: number;
  /** Replays the entrance whenever this value changes. */
  resetKey?: string | number;
  /** Class for each cell wrapper (defaults to full-height so cards align). */
  itemClassName?: string;
}

export function AnimatedGrid({
  children,
  className,
  stagger = 0.045,
  delay = 0.02,
  resetKey,
  itemClassName = 'h-full',
}: AnimatedGridProps) {
  const reduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);

  if (reduceMotion) {
    return (
      <div className={className}>
        {items.map((child, i) => (
          <div key={React.isValidElement(child) && child.key != null ? child.key : i} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        key={resetKey}
        className={className}
        variants={containerVariants(stagger, delay)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
      >
        {items.map((child, i) => (
          <motion.div
            key={React.isValidElement(child) && child.key != null ? child.key : i}
            variants={itemVariants}
            layout="position"
            className={itemClassName}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}
