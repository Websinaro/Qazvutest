'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { NotificationBell } from '@/src/components/layout/NotificationBell';
import { useCart } from '@/src/context/CartContext';
import { useWishlist } from '@/src/context/WishlistContext';
import { useTheme } from '@/src/context/ThemeContext';
import { BrandMark, Wordmark } from '@/src/components/ui/BrandMark';
import { AuthModal } from '@/src/components/auth/AuthModal';
import { ThemeToggle } from '@/src/components/layout/ThemeToggle';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Package,
  LogOut,
  Settings,
  Shield,
  Store,
  ArrowRight,
} from '@/src/components/ui/icons';
import { formatINR } from '@/src/lib/date';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const TICKER = [
  'Free delivery on orders above ₹999',
  'Every seller is checked before they list',
  'Seven days to change your mind',
  'Delivery dates you can plan around',
];

/** The category strip. Pure markup: `current` says which aisle to underline. */
function AisleLinks({
  categories,
  current,
  onProducts,
}: {
  categories: CategoryItem[];
  current: string | null;
  onProducts: boolean;
}) {
  const underline = 'underline decoration-2 decoration-marigold-400 underline-offset-[9px]';
  return (
    <nav className="flex items-center overflow-x-auto no-scrollbar text-[13px]" aria-label="Categories">
      <Link
        href="/products"
        className={`shrink-0 pr-4 font-bold whitespace-nowrap transition-colors hover:text-brand-700 dark:hover:text-brand-300 ${
          onProducts && !current ? underline : ''
        }`}
      >
        All aisles
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className={`shrink-0 px-4 whitespace-nowrap border-l border-rule text-neutral-700 dark:text-neutral-300 hover:text-ink transition-colors ${
            current === cat.slug ? `!text-ink font-semibold ${underline}` : ''
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}

/** Reads the URL (needs Suspense because of useSearchParams) and feeds AisleLinks. */
function ActiveAisleLinks({ categories }: { categories: CategoryItem[] }) {
  const pathname = usePathname() || '/';
  const params = useSearchParams();
  const onProducts = pathname.startsWith('/products');
  return <AisleLinks categories={categories} current={onProducts ? params.get('category') : null} onProducts={onProducts} />;
}

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, toggleCartDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { resolvedTheme } = useTheme();

  // Explicit color-scheme opt-out for icon wrappers: `only light`/`only
  // dark` (as opposed to the page-level `light dark`) tells the browser
  // "this subtree's colors are correct for this exact scheme, don't run
  // your auto-dark repaint heuristic on it". Some OEM WebViews (confirmed:
  // ColorOS/Oppo) still repaint inline SVG icon content specifically, so the
  // stricter value is scoped to just the icon wrappers and flips with the theme.
  const iconSafeStyle: React.CSSProperties = {
    colorScheme: resolvedTheme === 'dark' ? 'only dark' : 'only light',
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuTriggerRef = useRef<HTMLDivElement>(null);

  // Escape closes the profile dropdown and returns focus to its trigger.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        userMenuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isUserMenuOpen]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock background scroll while the mobile drawer is open so the page
  // underneath can't shift/jump behind the fixed overlay on touch devices.
  useEffect(() => {
    if (isMobileMenuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    router.push(`/products?${params.toString()}`);
  };

  const openLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const menuRow =
    'flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-neutral-800 dark:text-neutral-200 hover:bg-marigold-100 dark:hover:bg-white/10 transition-colors';

  const iconBtn =
    'relative grid place-items-center w-10 h-10 rounded-md text-ink hover:bg-ink/[0.07] active:translate-y-px transition cursor-pointer select-none force-dark-safe';

  const textLink =
    'relative inline-flex items-center gap-1.5 h-10 px-2.5 text-[13px] font-semibold text-ink hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer select-none';

  const activate = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper/95 backdrop-blur-[2px] border-b border-rule">
        {/* 1. Ticker strip: plain sentences, slowly scrolling */}
        <div className="hidden md:block bg-ink text-paper overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between gap-6">
            <div className="relative flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]">
              <div className="flex w-max animate-ticker whitespace-nowrap eyebrow !text-[10.5px] !tracking-[0.12em] opacity-90">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex items-center" aria-hidden={dup === 1 ? true : undefined}>
                    {TICKER.map((t) => (
                      <span key={`${dup}-${t}`} className="flex items-center">
                        <span className="px-5">{t}</span>
                        <span className="text-marigold-300" aria-hidden="true">✺</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <span className="shrink-0 hidden lg:inline-flex items-center gap-1.5 eyebrow !text-[10.5px] !tracking-[0.12em] opacity-80">
              <MapPin className="w-3 h-3" weight="fill" /> Deliver to Bengaluru 560038
            </span>
          </div>
        </div>

        {/* 2. Main bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-6 h-[64px]">
            {/* Mobile menu + logo */}
            <div className="flex items-center gap-1 shrink-0">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                onKeyDown={activate(() => setIsMobileMenuOpen((prev) => !prev))}
                className={`${iconBtn} lg:hidden -ml-2`}
                style={iconSafeStyle}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>

              <Link href="/" className="flex items-center gap-2.5 group" aria-label="QazvuCart home">
                <BrandMark className="w-9 h-9 group-hover:-rotate-12 transition-transform duration-300" />
                <Wordmark className="text-[1.55rem] sm:text-[1.7rem]" />
              </Link>
            </div>

            {/* Search (md+): a boxed field like one on a printed form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-xl hidden md:flex items-stretch h-11 rounded-md bg-card border-[1.5px] border-ink focus-within:shadow-stamp transition-shadow"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Search category"
                className="bg-transparent pl-3 pr-1 eyebrow !tracking-[0.08em] text-ink focus:outline-none cursor-pointer max-w-[8.5rem] truncate"
              >
                <option value="all">Everything</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="my-2.5 w-px bg-rule" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Looking for something?"
                className="flex-1 min-w-0 px-3.5 text-sm bg-transparent text-ink placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-4 rounded-r-[4px] bg-ink text-paper text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-brand-800 dark:hover:bg-brand-300 dark:hover:text-brand-950 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" weight="bold" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </form>

            <div className="flex-1 md:hidden" />

            {/* Actions */}
            <div className="relative flex items-center gap-0.5 shrink-0 md:ml-auto">
              <ThemeToggle className="hidden sm:grid" />
              <NotificationBell />

              <Link href="/account?tab=wishlist" className={`${textLink} hidden lg:inline-flex`} title="My wishlist" aria-label="My wishlist">
                <Heart className="w-[18px] h-[18px]" />
                <span>Saved</span>
                {wishlistItems.length > 0 && (
                  <span className="figures text-[11px] font-semibold text-chili-600 dark:text-chili-500">{wishlistItems.length}</span>
                )}
              </Link>

              {/* Account */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div
                    ref={userMenuTriggerRef}
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    onKeyDown={activate(() => setIsUserMenuOpen((prev) => !prev))}
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-label="Open account menu"
                    className="flex items-center gap-2 h-10 px-1 sm:pr-2 rounded-md hover:bg-ink/[0.07] transition-colors cursor-pointer select-none force-dark-safe"
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-[5px] bg-marigold-300 text-neutral-950 border-[1.5px] border-neutral-950 font-semibold text-[13px] shrink-0 -rotate-3">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden lg:block text-[13px] font-semibold text-ink max-w-[96px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openLogin}
                    onKeyDown={activate(openLogin)}
                    aria-label="Sign in"
                    className={`${textLink} force-dark-safe`}
                  >
                    <UserIcon className="w-[18px] h-[18px]" />
                    <span className="hidden sm:inline">Sign in</span>
                  </div>
                )}

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                    <div
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] bg-card border-[1.5px] border-ink rounded-md shadow-stamp z-50 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-right"
                    >
                      {user && (
                        <div className="flex items-center gap-3 px-3.5 py-3.5 border-b border-rule">
                          <span className="grid place-items-center w-10 h-10 rounded-[5px] bg-marigold-300 text-neutral-950 border-[1.5px] border-neutral-950 font-semibold -rotate-3">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display text-lg leading-none text-ink truncate">{user.username}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-1">{user.email}</p>
                          </div>
                          <span className="ml-auto shrink-0 eyebrow !text-[9.5px] border border-ink/60 rounded-[3px] px-1.5 py-1">
                            {user.role}
                          </span>
                        </div>
                      )}

                      <div className="py-1">
                        {user?.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className={`${menuRow} !font-bold text-brand-800 dark:text-brand-200`}>
                            <Shield className="w-4 h-4" /> Admin panel
                          </Link>
                        )}
                        {user?.role === 'SELLER' && (
                          <Link href="/seller-center" onClick={() => setIsUserMenuOpen(false)} className={`${menuRow} !font-bold text-brand-800 dark:text-brand-200`}>
                            <Store className="w-4 h-4" /> Seller Center
                          </Link>
                        )}
                        {user?.role === 'CUSTOMER' && (
                          <Link href="/sell" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                            <Store className="w-4 h-4 text-neutral-500" /> Sell on QazvuCart
                          </Link>
                        )}
                        <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                          <UserIcon className="w-4 h-4 text-neutral-500" /> Your account
                        </Link>
                        <Link href="/account?tab=orders" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                          <Package className="w-4 h-4 text-neutral-500" /> Orders &amp; tracking
                        </Link>
                        <Link href="/account?tab=addresses" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                          <MapPin className="w-4 h-4 text-neutral-500" /> Saved addresses
                        </Link>
                        <Link href="/account?tab=reviews" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                          <Heart className="w-4 h-4 text-neutral-500" /> Reviews to write
                        </Link>
                        <Link href="/account?tab=settings" onClick={() => setIsUserMenuOpen(false)} className={menuRow}>
                          <Settings className="w-4 h-4 text-neutral-500" /> Settings
                        </Link>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 border-t border-rule text-[13px] font-semibold text-chili-600 dark:text-chili-500 hover:bg-chili-100/60 dark:hover:bg-chili-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={toggleCartDrawer}
                className="ml-1.5 hidden lg:inline-flex items-center gap-2.5 h-10 pl-3 pr-3.5 rounded-md btn-ink cursor-pointer"
                aria-label="Open shopping cart"
              >
                <span className="relative" data-cart-target="">
                  <ShoppingBag className="w-[18px] h-[18px]" />
                </span>
                <span className="text-[13px] font-semibold">Cart</span>
                <span className="figures text-[12px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-marigold-300 text-neutral-950 min-w-[1.4rem] text-center">
                  {cart.totalItems}
                </span>
                <span className="figures text-[12px] opacity-80 hidden xl:inline">{formatINR(cart.subtotal)}</span>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="md:hidden pb-3 flex items-stretch gap-2">
            <div className="flex-1 flex items-center gap-2.5 h-11 px-3.5 rounded-md bg-card border-[1.5px] border-ink focus-within:shadow-stamp transition-shadow">
              <Search className="w-[18px] h-[18px] text-neutral-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Looking for something?"
                className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 rounded-md btn-ink text-[13px] font-semibold cursor-pointer"
              aria-label="Search"
            >
              Go
            </button>
          </form>
        </div>

        {/* 3. Aisle strip */}
        <div className="hidden md:block border-t border-rule">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-6">
            <Suspense fallback={<AisleLinks categories={categories} current={null} onProducts={false} />}>
              <ActiveAisleLinks categories={categories} />
            </Suspense>
            <div className="flex items-center gap-5 shrink-0 text-[13px] font-semibold">
              <Link href="/products?isDeal=true" className="inline-flex items-center gap-1.5 text-chili-600 dark:text-chili-500 hover:underline underline-offset-4 decoration-2">
                <span className="size-1.5 rounded-full bg-chili-500 animate-pulse" aria-hidden="true" /> Today&apos;s deals
              </Link>
              <Link href="/products?isFeatured=true" className="hover:underline underline-offset-4 decoration-2 decoration-marigold-400">
                Staff picks
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-950/55 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[88%] max-w-sm bg-paper border-r-[1.5px] border-ink flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 h-16 border-b border-rule shrink-0">
              <div className="flex items-center gap-2.5">
                <BrandMark className="w-8 h-8" />
                <Wordmark className="text-[1.45rem]" />
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onKeyDown={activate(() => setIsMobileMenuOpen(false))}
                  className={iconBtn}
                  style={iconSafeStyle}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-12 h-12 rounded-md bg-marigold-300 text-neutral-950 border-[1.5px] border-neutral-950 font-semibold text-lg -rotate-3">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-xl leading-none text-ink truncate">Hi, {user.username}</p>
                      <p className="text-xs text-neutral-500 truncate mt-1">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-md border-[1.5px] border-ink font-semibold text-[13px]"
                    >
                      <Shield className="w-4 h-4" /> Go to admin panel
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 text-[14px]">
                    {[
                      { href: '/account?tab=orders', label: 'Orders', Icon: Package },
                      { href: '/account?tab=wishlist', label: 'Saved', Icon: Heart },
                      { href: '/account?tab=addresses', label: 'Addresses', Icon: MapPin },
                      { href: '/account?tab=settings', label: 'Settings', Icon: Settings },
                    ].map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 h-12 border-b border-rule font-medium"
                      >
                        <Icon className="w-4 h-4 text-neutral-500" /> {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openLogin();
                    }}
                    className="w-full h-11 rounded-md btn-ink font-semibold text-[13px] cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openRegister();
                    }}
                    className="w-full h-11 rounded-md border-[1.5px] border-ink text-ink font-semibold text-[13px] cursor-pointer"
                  >
                    Create an account
                  </button>
                </div>
              )}

              <div>
                <p className="eyebrow text-neutral-500 mb-3">The aisles</p>
                <div className="border-t border-rule">
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-baseline gap-3 py-3 border-b border-rule"
                  >
                    <span className="figures text-[11px] text-neutral-500 w-5">00</span>
                    <span className="font-display text-[1.65rem] leading-none flex-1">Everything</span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 self-center" />
                  </Link>
                  {categories.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-baseline gap-3 py-3 border-b border-rule"
                    >
                      <span className="figures text-[11px] text-neutral-500 w-5">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-[1.65rem] leading-none flex-1">{c.name}</span>
                      <ArrowRight className="w-4 h-4 text-neutral-500 self-center" />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/products?isDeal=true"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-5 inline-flex sticker"
                >
                  Today&apos;s deals →
                </Link>
              </div>
            </div>

            {isAuthenticated && (
              <div className="px-5 py-4 border-t border-rule shrink-0">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 h-11 text-chili-600 dark:text-chili-500 font-semibold text-[13px] hover:bg-chili-100/60 dark:hover:bg-chili-500/10 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
