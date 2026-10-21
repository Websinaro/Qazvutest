'use client';

import React from 'react';
import Link from 'next/link';
import { BrandMark, Wordmark } from '@/src/components/ui/BrandMark';
import { Underline } from '@/src/components/ui/Hand';

const AISLES = [
  { href: '/products?category=electronics', label: 'Electronics & audio' },
  { href: '/products?category=fashion', label: 'Fashion & apparel' },
  { href: '/products?category=home-living', label: 'Home & living' },
  { href: '/products?category=beauty-care', label: 'Beauty & skincare' },
  { href: '/products?category=sports-fitness', label: 'Sports & fitness' },
];

const HELP = [
  { href: '/account?tab=orders', label: 'Track an order' },
  { href: '/account?tab=addresses', label: 'Shipping & delivery' },
  { href: '/account?tab=reviews', label: 'Write a review' },
  { href: '/account?tab=settings', label: 'Account settings' },
];

const SELL = [
  { href: '/sell', label: 'Open a shop here' },
  { href: '/seller-center', label: 'Seller Center' },
];

const link = 'inline-block py-1 text-[14px] text-paper/70 hover:text-paper underline-offset-4 hover:underline decoration-marigold-300 decoration-2 transition-colors';

export function Footer() {
  return (
    <footer className="relative mt-16 sm:mt-28 bg-ink text-paper">
      {/* torn top edge */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 14"
        preserveAspectRatio="none"
        className="absolute -top-[13px] left-0 w-full h-[14px] text-ink"
      >
        <path
          fill="currentColor"
          d="M0 14V7l24-5 28 6 31-6 27 5 33-4 29 6 30-5 26 4 34-5 30 6 28-4 32 5 27-5 31 6 29-5 33 4 28-5 30 6 31-4 27 5 32-6 30 5 28-4 33 6 29-5 30 4 27-5 34 6 31-5 28 5 30-4 32 5 27-5 29 5 33-4 30 5 28-6 31 5 27-4 34 5 30-5 29 6 28-5 33 4 31-5 28 5 30-4 29 5 32-6 27 5 31-4 30 5 29-5 33 6 28-5 30 4 31-5 27 5 32-4 30 5 28-5 33 5 29-4 30 5 27-5 34 4 31-5 29 5 28-4 30 5V14Z"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Sign-off */}
          <div className="lg:col-span-6">
            <p className="font-display text-[2.1rem] sm:text-5xl leading-[1.05] max-w-xl">
              Made for people who{' '}
              <span className="relative inline-block text-marigold-300">
                read the product page
                <Underline className="text-marigold-300/80" animate={false} />
              </span>
              .
            </p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/65">
              QazvuCart is a marketplace of independent sellers. We check every shop before it opens, show you
              honest delivery dates and keep returns simple.
            </p>
            <Link href="/" className="mt-8 inline-flex items-center gap-3 group" aria-label="QazvuCart home">
              <BrandMark className="w-10 h-10 group-hover:-rotate-12 transition-transform duration-300 ring-1 ring-paper/20" />
              <Wordmark className="text-[1.7rem] text-paper [&>span]:!text-marigold-300" />
            </Link>
          </div>

          {/* Lists */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
            <div>
              <h5 className="eyebrow text-paper/50 mb-4">The aisles</h5>
              <ul>
                {AISLES.map((l) => (
                  <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="eyebrow text-paper/50 mb-4">Help</h5>
              <ul>
                {HELP.map((l) => (
                  <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h5 className="eyebrow text-paper/50 mb-4">For sellers</h5>
              <ul>
                {SELL.map((l) => (
                  <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
                ))}
              </ul>
              <p className="note mt-6 text-marigold-300 -rotate-2 max-w-[11rem]">got a shop? come say hi.</p>
            </div>
          </div>
        </div>

        {/* Terms of the deal, in one honest line each */}
        <ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-paper/15">
          {[
            ['Original goods', 'Sold by shops we have checked.'],
            ['Free delivery', 'On orders above ₹999.'],
            ['Seven-day returns', 'Replace it if it is damaged or wrong.'],
            ['Safe checkout', 'Encrypted payments, UPI to COD.'],
          ].map(([t, c], i) => (
            <li key={t} className={`py-5 sm:pr-6 ${i > 0 ? 'lg:pl-6 lg:border-l border-paper/15' : ''} border-b sm:border-b-0 border-paper/15`}>
              <p className="text-[15px] font-semibold">{t}</p>
              <p className="text-[13px] text-paper/60 mt-0.5">{c}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-paper/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-paper/50">
          <p>© 2026 QazvuCart Technologies Inc.</p>
          <p className="figures">UPI · Visa · Mastercard · NetBanking · COD</p>
        </div>
      </div>
    </footer>
  );
}
