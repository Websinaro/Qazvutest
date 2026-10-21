'use client';

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, type AppIcon } from '@/src/components/ui/icons';
import { ProductCard, ProductCardProps } from '@/src/components/product/ProductCard';
import { ProductCardSkeleton } from '@/src/components/product/ProductCardSkeleton';

/**
 * A horizontal shelf of products. `icon` and `accent` are accepted so older
 * callers keep compiling, but the new design doesn't use them: shelves are
 * labelled with a serif heading and a quiet one-line note.
 */
export function ProductRail({
  title,
  subtitle,
  products,
  isLoading,
  skeletonCount = 4,
}: {
  title: string;
  subtitle?: string;
  icon?: AppIcon;
  products: ProductCardProps[];
  isLoading: boolean;
  skeletonCount?: number;
  accent?: 'default' | 'amber';
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };

  if (!isLoading && products.length === 0) return null;

  const arrow =
    'grid place-items-center w-10 h-10 rounded-md border-[1.5px] border-ink text-ink hover:bg-ink hover:text-paper active:translate-y-px transition-colors cursor-pointer';

  return (
    <section className="py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-rule pb-4">
        <div className="min-w-0">
          <h2 className="text-[1.75rem] sm:text-[2.2rem]">{title}</h2>
          {subtitle && <p className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5">{subtitle}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button onClick={() => scrollBy(-320)} aria-label="Scroll left" className={arrow}>
            <ArrowLeft className="w-4 h-4" weight="bold" />
          </button>
          <button onClick={() => scrollBy(320)} aria-label="Scroll right" className={arrow}>
            <ArrowRight className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="w-[46vw] sm:w-[240px] shrink-0 snap-start">
                <ProductCardSkeleton index={i} />
              </div>
            ))
          : products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 6) * 0.05 }}
                className="w-[46vw] sm:w-[240px] shrink-0 snap-start"
              >
                <ProductCard {...p} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
