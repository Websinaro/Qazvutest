'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard, ProductCardProps } from '@/src/components/product/ProductCard';
import { ProductGridSkeleton } from '@/src/components/product/ProductCardSkeleton';
import { AnimatedGrid } from '@/src/components/ui/AnimatedGrid';
import { Underline, Arrow } from '@/src/components/ui/Hand';
import { useDealCountdown } from '@/src/lib/dealCountdown';
import { useAuth } from '@/src/context/AuthContext';
import { RecentlyViewedRail } from '@/src/components/product/RecentlyViewedRail';
import { TrendingRail } from '@/src/components/product/TrendingRail';
import { PersonalizedRail } from '@/src/components/product/PersonalizedRail';
import { ArrowRight } from '@/src/components/ui/icons';
import { formatINR } from '@/src/lib/date';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  description: string;
  productCount: number;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80';

/** Numbered section heading, like a chapter opener in a catalogue. */
function SectionHead({
  no,
  title,
  note,
  href,
  cta,
}: {
  no: string;
  title: string;
  note?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10 pb-4 border-b border-rule">
      <div className="min-w-0">
        <p className="eyebrow text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="text-chili-600 dark:text-chili-500">{no}</span> &nbsp;/&nbsp; {title}
        </p>
        <h2 className="text-[2.1rem] sm:text-5xl">{title}</h2>
        {note && <p className="text-[14px] sm:text-[15px] text-neutral-600 dark:text-neutral-400 mt-2 max-w-md">{note}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 group inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-2 decoration-marigold-400 underline-offset-[6px] hover:decoration-ink"
        >
          {cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [deals, setDeals] = useState<ProductCardProps[]>([]);
  const [featured, setFeatured] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');
  const { user } = useAuth();

  // Set after mount so server and client markup agree.
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  // Deal countdown: counts down to real end-of-day, see useDealCountdown().
  const timeLeft = useDealCountdown();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, dealsRes, featRes] = await Promise.all([
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/products?isDeal=true&limit=4').then((r) => r.json()),
          fetch('/api/products?isFeatured=true&limit=7').then((r) => r.json()),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (dealsRes.success) setDeals(dealsRes.data.products);
        if (featRes.success) setFeatured(featRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const pad = (v: number) => String(v).padStart(2, '0');

  const wrap = 'max-w-7xl mx-auto px-4 sm:px-6';
  const section = `${wrap} pt-16 sm:pt-28`;

  // A second print on the hero table, borrowed from whatever is featured.
  const secondPrint = featured.find((p) => p.primaryImage && p.slug !== 'sonicblast-pro-wireless-headphones');

  return (
    <div className="min-h-screen pb-8">
      {/* 01. Hero ------------------------------------------------------- */}
      <section className={`${wrap} pt-8 sm:pt-14`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <div className="lg:col-span-7 lg:pr-10">
            <p className="hero-in [--d:0.05s] eyebrow text-neutral-600 dark:text-neutral-400">
              {greeting}, {user?.username ?? 'friend'}
            </p>
            <h1 className="hero-in [--d:0.12s] mt-5 text-[2.9rem] sm:text-7xl lg:text-[5.4rem] leading-[0.98]">
              Everyday things,
              <br />
              <span className="relative inline-block text-brand-800 dark:text-brand-300">
                picked with care
                <Underline className="text-marigold-400" delay="0.5s" />
              </span>
              .
            </h1>
            <p className="hero-in [--d:0.22s] mt-7 max-w-md text-[16px] sm:text-[17px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              Headphones, laptops, kitchen gear and more, from independent sellers we have checked, with
              delivery dates you can plan around.
            </p>

            <div className="hero-in [--d:0.3s] mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-md btn-ink text-[15px] font-semibold"
              >
                Shop what&apos;s new
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
              <Link
                href="/products?isDeal=true"
                className="text-[15px] font-semibold underline decoration-2 decoration-chili-500 underline-offset-[6px] hover:decoration-ink transition-colors"
              >
                See today&apos;s deals
              </Link>
            </div>

            <dl className="hero-in [--d:0.4s] mt-12 flex flex-wrap gap-y-3 divide-x divide-rule border-y border-rule py-3 text-[12.5px]">
              {[
                ['Free delivery', 'over ₹999'],
                ['7-day returns', 'no questions about it'],
                ['Verified sellers', 'every shop'],
              ].map(([a, b]) => (
                <div key={a} className="px-4 first:pl-0 last:pr-0">
                  <dt className="font-semibold">{a}</dt>
                  <dd className="text-neutral-600 dark:text-neutral-400">{b}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The photos: prints on a table */}
          <div className="lg:col-span-5 relative min-h-[400px] sm:min-h-[540px] lg:min-h-[560px]">
            <Link
              href="/products/sonicblast-pro-wireless-headphones"
              aria-label="View SonicBlast Pro wireless headphones"
              style={{ '--tilt': '2.5deg', '--d': '0.15s' } as React.CSSProperties}
              className="print-in absolute right-0 top-0 w-[76%] sm:w-[72%] bg-card border border-rule p-2.5 pb-12 shadow-[6px_6px_0_var(--rule)] group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <Image
                  src={HERO_IMAGE}
                  alt="SonicBlast Pro wireless headphones"
                  fill
                  priority
                  sizes="(max-width: 1024px) 70vw, 30vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="note absolute left-4 bottom-3 text-[1.35rem] text-ink">SonicBlast Pro</span>
              <span className="sticker !text-[13px] !px-2.5 !py-1 absolute -top-3 -right-3 !rotate-[8deg] group-hover:!rotate-[3deg] transition-transform">
                {formatINR(1499)}
              </span>
            </Link>

            {secondPrint && (
              <Link
                href={`/products/${secondPrint.slug}`}
                aria-label={`View ${secondPrint.name}`}
                style={{ '--tilt': '-5deg', '--d': '0.35s' } as React.CSSProperties}
                className="print-in absolute left-0 bottom-0 w-[46%] sm:w-[44%] bg-card border border-rule p-2 pb-9 shadow-[5px_5px_0_var(--rule)] group"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={secondPrint.primaryImage}
                    alt={secondPrint.name}
                    fill
                    sizes="(max-width: 1024px) 40vw, 18vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="note absolute left-3 right-3 bottom-2 text-[1.05rem] text-ink truncate">{secondPrint.name}</span>
              </Link>
            )}

            <div className="hidden sm:flex absolute left-[4%] top-[8%] items-start gap-1 text-chili-600 dark:text-chili-500 -rotate-6">
              <span className="note text-[1.5rem] leading-[1.05] max-w-[7rem]">our pick of the week</span>
              <Arrow className="w-14 h-8 mt-5 -rotate-[8deg]" />
            </div>
          </div>
        </div>

        {/* Two to look at: typeset as a list, not as promo cards */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 md:divide-x divide-rule border-y border-rule">
          <Link
            href="/products/aurabook-max-ultra-thin-laptop"
            aria-label="View AuraBook Max"
            className="group flex items-center justify-between gap-6 py-6 md:pr-8 hover:bg-marigold-100/50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="min-w-0">
              <p className="eyebrow text-chili-600 dark:text-chili-500">Top seller</p>
              <h3 className="mt-2 font-display text-[1.45rem] sm:text-[1.7rem] leading-tight">AuraBook Max 15.6&quot; Ultra Laptop</h3>
              <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">Intel Core i7 · 16GB RAM · 512GB SSD</p>
              <p className="mt-3 flex items-baseline gap-2.5">
                <span className="figures text-xl font-semibold">{formatINR(54999)}</span>
                <span className="figures text-[13px] text-neutral-500 line-through">{formatINR(79999)}</span>
              </p>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 group-hover:translate-x-1.5 transition-transform" weight="bold" />
          </Link>

          <Link
            href="/products/novapulse-smartwatch-series-7"
            aria-label="View NovaPulse Series 7"
            className="group flex items-center justify-between gap-6 py-6 md:pl-8 border-t md:border-t-0 border-rule hover:bg-marigold-100/50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="min-w-0">
              <p className="eyebrow">
                <span className="sticker sticker-chili !rotate-[-2deg]">Half price</span>
              </p>
              <h3 className="mt-2.5 font-display text-[1.45rem] sm:text-[1.7rem] leading-tight">NovaPulse Series 7 Smartwatch</h3>
              <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">Always-on AMOLED · Calling · IP68</p>
              <p className="mt-3 flex items-baseline gap-2.5">
                <span className="figures text-xl font-semibold">{formatINR(2999)}</span>
                <span className="figures text-[13px] text-neutral-500 line-through">{formatINR(5999)}</span>
              </p>
            </div>
            <ArrowRight className="w-6 h-6 shrink-0 group-hover:translate-x-1.5 transition-transform" weight="bold" />
          </Link>
        </div>
      </section>

      {/* 02. The aisles: an index, not a grid of icons ------------------- */}
      <section className={section}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-44">
              <p className="eyebrow text-neutral-500 dark:text-neutral-400 mb-3">
                <span className="text-chili-600 dark:text-chili-500">01</span> &nbsp;/&nbsp; Browse
              </p>
              <h2 className="text-[2.1rem] sm:text-5xl">Walk the aisles</h2>
              <p className="mt-4 text-[15px] text-neutral-600 dark:text-neutral-400 max-w-xs">
                Genuine products from verified sellers, sorted the way you would shelve them at home.
              </p>
              <Link
                href="/products"
                className="mt-6 group inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-2 decoration-marigold-400 underline-offset-[6px] hover:decoration-ink"
              >
                See everything
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
            </div>
          </div>

          <ol className="lg:col-span-8 border-t border-ink">
            {categories.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="h-[92px] border-b border-rule flex items-center gap-4">
                  <span className="h-4 w-6 shimmer-bg rounded-sm" />
                  <span className="h-8 w-1/2 shimmer-bg rounded-sm" />
                </li>
              ))}
            {categories.map((cat, i) => (
              <li key={cat.id} className="border-b border-rule">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group flex items-center gap-4 sm:gap-6 py-4 sm:py-5 hover:bg-marigold-100/60 dark:hover:bg-white/[0.04] transition-colors px-1 sm:px-3 -mx-1 sm:-mx-3"
                >
                  <span className="figures text-[12px] text-neutral-500 w-6 shrink-0 self-start mt-3">{pad(i + 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-end gap-3">
                      <span className="font-display text-[1.85rem] sm:text-[2.6rem] leading-none nudge group-hover:text-brand-800 dark:group-hover:text-brand-300 transition-colors">
                        {cat.name}
                      </span>
                      <span className="leader hidden sm:block" aria-hidden="true" />
                      <span className="figures text-[12px] text-neutral-600 dark:text-neutral-400 shrink-0 pb-1">
                        {cat.productCount} items
                      </span>
                    </span>
                    {cat.description && (
                      <span className="block mt-1.5 text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {cat.description}
                      </span>
                    )}
                  </span>
                  {cat.imageUrl && (
                    <span className="relative hidden sm:block w-16 h-16 shrink-0 overflow-hidden rounded-md border border-rule bg-neutral-200 dark:bg-neutral-800 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      <Image
                        src={cat.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </span>
                  )}
                  <ArrowRight className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" weight="bold" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 03. Today's deals: a perforated coupon ---------------------------- */}
      <section className={section}>
        <div className="ticket px-3 py-3 sm:px-5 sm:py-5">
          <div className="border-2 border-dashed border-neutral-950/35 dark:border-paper/25 rounded-md p-5 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 sm:pb-10">
              <div>
                <p className="eyebrow opacity-70 mb-3">
                  <span className="text-chili-600 dark:text-chili-500">02</span> &nbsp;/&nbsp; Valid until midnight
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-[2.3rem] sm:text-6xl">Today&apos;s deals</h2>
                  <span className="sticker sticker-chili !rotate-[-5deg] !text-[12px]">up to 50% off</span>
                </div>
                <p className="mt-3 text-[14px] sm:text-[15px] opacity-75 max-w-sm">
                  Verified discounts, refreshed every 24 hours. When the clock hits zero, the prices go back.
                </p>
              </div>

              <div className="flex items-end gap-1.5 sm:gap-2 figures" role="timer" aria-label="Time left on today's deals">
                {[
                  [timeLeft.hours, 'hours'],
                  [timeLeft.minutes, 'mins'],
                  [timeLeft.seconds, 'secs'],
                ].map(([v, label], i) => (
                  <React.Fragment key={label as string}>
                    {i > 0 && <span className="text-3xl sm:text-5xl font-light pb-3 opacity-50">:</span>}
                    <span className="flex flex-col items-center">
                      <span className="text-[2.6rem] sm:text-6xl font-semibold leading-none tabular-nums">{pad(v as number)}</span>
                      <span className="eyebrow !text-[9.5px] opacity-60 mt-2">{label}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={4} className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6" />
            ) : (
              <AnimatedGrid
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6"
                itemClassName="h-full lg:even:mt-10"
              >
                {deals.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </AnimatedGrid>
            )}
          </div>
        </div>
      </section>

      {/* Picked for you (hides itself for first-time visitors) */}
      <div className={wrap}>
        <PersonalizedRail />
      </div>

      {/* 04. Staff picks: one big, six small ------------------------------- */}
      <section className={section}>
        <SectionHead
          no="03"
          title="Staff picks"
          note="Customer favourites with 4.5+ verified ratings."
          href="/products?isFeatured=true"
          cta="All staff picks"
        />
        {isLoading ? (
          <ProductGridSkeleton count={6} className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-9 sm:gap-x-6" />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-44">
              <div className="relative">
                <ProductCard {...featured[0]} variant="feature" />
                <span className="note absolute -top-6 right-2 text-chili-600 dark:text-chili-500 rotate-6 text-[1.6rem] hidden sm:block">
                  start here →
                </span>
              </div>
            </div>
            <div className="lg:col-span-7">
              <AnimatedGrid
                className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6"
                itemClassName="h-full"
              >
                {featured.slice(1).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </AnimatedGrid>
            </div>
          </div>
        ) : null}
      </section>

      {/* Trending now */}
      <div className={wrap}>
        <TrendingRail />
      </div>

      {/* Recently viewed */}
      <div className={wrap}>
        <RecentlyViewedRail />
      </div>

      {/* 05. Our word on it ------------------------------------------------ */}
      <section className={section}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-t border-ink pt-10 sm:pt-14">
          <p className="lg:col-span-7 font-display text-[1.9rem] sm:text-5xl leading-[1.1]">
            Every shop is checked before it opens. Delivery dates are{' '}
            <span className="text-gradient">real ones</span>. And if something is not right,
            you have seven days to send it back.
          </p>
          <ol className="lg:col-span-5 divide-y divide-rule border-y border-rule self-end">
            {[
              ['Authentic, or your money back', 'Every merchant is compliance-verified and sells original manufacturer stock.'],
              ['Delivery you can plan around', 'Live warehouse tracking, honest delivery dates and free shipping over ₹999.'],
              ['Seven days to change your mind', 'Return or replace anything damaged or mismatched, with an instant refund.'],
            ].map(([t, c], i) => (
              <li key={t} className="flex gap-4 py-4">
                <span className="figures text-[12px] text-chili-600 dark:text-chili-500 pt-1">{pad(i + 1)}</span>
                <div>
                  <h4 className="text-[15px] font-semibold">{t}</h4>
                  <p className="text-[13.5px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{c}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sell with us -------------------------------------------------------- */}
      <section className={`${wrap} pt-16 sm:pt-24`}>
        <div className="relative overflow-hidden rounded-lg bg-brand-800 text-brand-50 px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="eyebrow text-marigold-300 mb-4">For sellers</p>
            <h2 className="text-[2.2rem] sm:text-5xl text-white">Run a shop? Open it here.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-100/85">
              Apply in a few minutes. Our team reviews every application before a store goes live, and a
              commission is only charged when you make a sale.
            </p>
          </div>
          <div className="relative shrink-0">
            <Link
              href="/sell"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-md bg-marigold-300 text-neutral-950 text-[15px] font-semibold shadow-[0_3px_0_rgb(0_0_0/0.35)] hover:-translate-y-px active:translate-y-px transition"
            >
              Apply to sell
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
            </Link>
            <span className="note hidden md:block absolute -top-9 -left-14 text-marigold-200 -rotate-6 text-[1.4rem]">
              takes a few minutes
            </span>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-6 -bottom-10 font-display text-[11rem] leading-none text-white/[0.05] rotate-[-8deg]"
          >
            Open
          </span>
        </div>
      </section>
    </div>
  );
}
