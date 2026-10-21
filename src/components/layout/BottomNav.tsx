'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/src/context/CartContext';
import { useWishlist } from '@/src/context/WishlistContext';
import { Home, Search, ShoppingBag, Heart, User, type AppIcon } from '@/src/components/ui/icons';

type Tab = {
  key: string;
  label: string;
  href: string;
  Icon: AppIcon;
  isActive: (path: string, tab: string | null) => boolean;
};

const TABS: Tab[] = [
  { key: 'home', label: 'Home', href: '/', Icon: Home, isActive: (p) => p === '/' },
  { key: 'explore', label: 'Browse', href: '/products', Icon: Search, isActive: (p) => p.startsWith('/products') },
  { key: 'cart', label: 'Cart', href: '/cart', Icon: ShoppingBag, isActive: (p) => p.startsWith('/cart') || p.startsWith('/checkout') },
  {
    key: 'wishlist',
    label: 'Saved',
    href: '/account?tab=wishlist',
    Icon: Heart,
    isActive: (p, t) => p.startsWith('/account') && t === 'wishlist',
  },
  {
    key: 'profile',
    label: 'You',
    href: '/account',
    Icon: User,
    isActive: (p, t) => p.startsWith('/account') && t !== 'wishlist',
  },
];

function BottomNavInner() {
  const pathname = usePathname() || '/';
  const tab = useSearchParams().get('tab');
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();

  // Seller / admin consoles have their own chrome.
  if (pathname.startsWith('/admin') || pathname.startsWith('/seller-center')) return null;

  const badge = (key: string) => {
    if (key === 'cart') return cart.totalItems;
    if (key === 'wishlist') return wishlistItems.length;
    return 0;
  };

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-paper border-t-[1.5px] border-ink pb-safe"
    >
      <ul className="mx-auto max-w-lg grid grid-cols-5">
        {TABS.map(({ key, label, href, Icon, isActive }) => {
          const active = isActive(pathname, tab);
          const count = badge(key);
          return (
            <li key={key} className={active ? 'bg-marigold-200 dark:bg-marigold-300/15' : ''}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 pt-2.5 pb-2 select-none"
              >
                <span data-cart-target={key === 'cart' ? '' : undefined} className="relative grid place-items-center h-6 w-8">
                  <Icon
                    className={`w-[22px] h-[22px] ${active ? 'text-ink' : 'text-neutral-600 dark:text-neutral-400'}`}
                    weight={active ? 'fill' : 'regular'}
                  />
                  {count > 0 && (
                    <span className="absolute -top-1.5 right-0 min-w-[17px] h-[17px] px-1 grid place-items-center rounded-[4px] bg-chili-500 text-white figures text-[10px] font-semibold">
                      {count}
                    </span>
                  )}
                </span>
                <span
                  className={`eyebrow !text-[9.5px] !tracking-[0.1em] ${
                    active ? 'text-ink font-bold' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}
