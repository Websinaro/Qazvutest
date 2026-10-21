'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard, ProductCardProps } from '@/src/components/product/ProductCard';
import { ProductGridSkeleton } from '@/src/components/product/ProductCardSkeleton';
import { AnimatedGrid } from '@/src/components/ui/AnimatedGrid';
import { Tick } from '@/src/components/ui/Hand';
import { SlidersHorizontal, X, Star, RotateCcw, ArrowLeft, ArrowRight } from '@/src/components/ui/icons';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

/** A checkbox drawn like one on a printed form. */
function Box({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center size-[18px] shrink-0 rounded-[3px] border-[1.5px] border-ink transition-colors ${
        checked ? 'bg-ink text-paper' : 'bg-card'
      }`}
    >
      {checked && <Tick className="w-3 h-3" />}
    </span>
  );
}

const sideHead = 'eyebrow text-neutral-600 dark:text-neutral-400 mb-3';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minRatingParam = searchParams.get('minRating') || '';
  const minDiscountParam = searchParams.get('minDiscount') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const isDealParam = searchParams.get('isDeal') === 'true';
  const isFeaturedParam = searchParams.get('isFeatured') === 'true';
  const sortParam = searchParams.get('sort') || 'relevance';
  const pageParam = Number(searchParams.get('page')) || 1;

  // Local filter states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Price inputs local state
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  // Fetch products based on searchParams
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const queryString = searchParams.toString();
        const res = await fetch(`/api/products?${queryString}`);
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setProducts(json.data.products);
          setTotalCount(json.data.pagination.total);
          setTotalPages(json.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [searchParams]);

  // Update URL helper
  const updateFilters = (newParams: Record<string, string | number | boolean | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    // reset to page 1 on filter change
    if (!('page' in newParams)) {
      current.set('page', '1');
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === undefined || (key === 'category' && val === 'all')) {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });

    router.push(`/products?${current.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/products');
  };

  const activeCategory = categories.find((c) => c.slug === categoryParam);

  const hasActiveFilters =
    categoryParam !== 'all' ||
    Boolean(qParam) ||
    Boolean(minPriceParam) ||
    Boolean(maxPriceParam) ||
    Boolean(minRatingParam) ||
    Boolean(minDiscountParam) ||
    inStockParam ||
    isDealParam ||
    isFeaturedParam;

  const gridClass =
    gridCols === 4
      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-9 sm:gap-x-5'
      : gridCols === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10'
      : 'grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-9 sm:gap-x-6';

  const chip =
    'inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-[4px] border-[1.5px] border-ink bg-card text-[12px] font-semibold';
  const chipX = 'grid place-items-center size-4 rounded-[3px] hover:bg-ink hover:text-paper transition-colors cursor-pointer';

  const underlineInput =
    'w-full bg-transparent border-b-[1.5px] border-ink px-0 py-2 figures text-[14px] text-ink placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 rounded-none';

  /** The filter stack, shared by the desktop sidebar and the mobile drawer. */
  const filters = (closeOnPick: boolean) => {
    const after = () => closeOnPick && setIsMobileFilterOpen(false);
    return (
      <div className="space-y-9">
        {/* Aisles */}
        <div>
          <h3 className={sideHead}>Aisle</h3>
          <ul className="border-t border-ink">
            {[{ id: 0, name: 'Everything', slug: 'all', productCount: categories.reduce((a, b) => a + b.productCount, 0) }, ...categories].map((c) => {
              const active = categoryParam === c.slug;
              return (
                <li key={c.id} className="border-b border-rule">
                  <button
                    onClick={() => {
                      updateFilters({ category: c.slug === 'all' ? null : c.slug });
                      after();
                    }}
                    className={`w-full flex items-center gap-2.5 py-2.5 text-left text-[14px] cursor-pointer transition-colors hover:text-brand-700 dark:hover:text-brand-300 ${
                      active ? 'font-bold text-ink' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className={`size-2 shrink-0 ${active ? 'bg-marigold-400 border border-ink' : 'border border-transparent'}`} aria-hidden="true" />
                    <span className="flex-1">{c.name}</span>
                    <span className="figures text-[11.5px] text-neutral-500">{c.productCount}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price */}
        <div>
          <h3 className={sideHead}>Price, in ₹</h3>
          <form
            onSubmit={(e) => {
              handlePriceApply(e);
              after();
            }}
            className="space-y-4"
          >
            <div className="flex items-end gap-3">
              <label className="flex-1 block">
                <span className="text-[11px] text-neutral-500">From</span>
                <input type="number" placeholder="0" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} className={underlineInput} />
              </label>
              <span className="pb-2.5 text-neutral-500">–</span>
              <label className="flex-1 block">
                <span className="text-[11px] text-neutral-500">To</span>
                <input type="number" placeholder="100000" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} className={underlineInput} />
              </label>
            </div>
            <button
              type="submit"
              className="h-9 px-4 rounded-md border-[1.5px] border-ink text-[12.5px] font-semibold hover:bg-ink hover:text-paper transition-colors cursor-pointer"
            >
              Apply
            </button>
          </form>
          <p className="mt-4 text-[13px] text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-x-2 gap-y-1">
            {[
              { l: 'Under ₹1K', min: '', max: '1000' },
              { l: '₹1K to ₹5K', min: '1000', max: '5000' },
              { l: 'Over ₹5K', min: '5000', max: '' },
            ].map((p, i) => (
              <React.Fragment key={p.l}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <button
                  onClick={() => {
                    setMinPriceInput(p.min);
                    setMaxPriceInput(p.max);
                    updateFilters({ minPrice: p.min || null, maxPrice: p.max || null });
                    after();
                  }}
                  className="underline decoration-marigold-400 decoration-2 underline-offset-4 hover:text-ink cursor-pointer"
                >
                  {p.l}
                </button>
              </React.Fragment>
            ))}
          </p>
        </div>

        {/* Rating */}
        <div>
          <h3 className={sideHead}>Rating</h3>
          <ul className="border-t border-ink">
            {[4, 3].map((star) => {
              const active = minRatingParam === String(star);
              return (
                <li key={star} className="border-b border-rule">
                  <button
                    onClick={() => {
                      updateFilters({ minRating: active ? null : star });
                      after();
                    }}
                    className="w-full flex items-center gap-3 py-2.5 text-left text-[14px] cursor-pointer"
                  >
                    <Box checked={active} />
                    <span className="flex items-center gap-1.5">
                      <span className={active ? 'font-bold' : ''}>{star}</span>
                      <Star className="w-3.5 h-3.5 text-marigold-500" weight="fill" />
                      <span className="text-neutral-600 dark:text-neutral-400">and up</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Discount */}
        <div>
          <h3 className={sideHead}>Discount</h3>
          <ul className="border-t border-ink">
            {[50, 40, 30, 20].map((disc) => {
              const active = minDiscountParam === String(disc);
              return (
                <li key={disc} className="border-b border-rule">
                  <button
                    onClick={() => {
                      updateFilters({ minDiscount: active ? null : disc });
                      after();
                    }}
                    className="w-full flex items-center gap-3 py-2.5 text-left text-[14px] cursor-pointer"
                  >
                    <Box checked={active} />
                    <span className={active ? 'font-bold' : ''}>{disc}% off or more</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Availability */}
        <div>
          <h3 className={sideHead}>Only show</h3>
          <ul className="border-t border-ink">
            {[
              { label: 'In stock', on: inStockParam, key: 'inStock' },
              { label: "Today's deals", on: isDealParam, key: 'isDeal' },
              { label: 'Staff picks', on: isFeaturedParam, key: 'isFeatured' },
            ].map((o) => (
              <li key={o.key} className="border-b border-rule">
                <button
                  onClick={() => {
                    updateFilters({ [o.key]: o.on ? null : true });
                    after();
                  }}
                  className="w-full flex items-center gap-3 py-2.5 text-left text-[14px] cursor-pointer"
                >
                  <Box checked={o.on} />
                  <span className={o.on ? 'font-bold' : ''}>{o.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              clearAllFilters();
              after();
            }}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-chili-600 dark:text-chili-500 underline underline-offset-4 decoration-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Clear every filter
          </button>
        )}
      </div>
    );
  };

  const pageBtn =
    'inline-flex items-center gap-1.5 h-10 px-4 rounded-md border-[1.5px] border-ink text-[13px] font-semibold hover:bg-ink hover:text-paper disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink disabled:cursor-not-allowed transition-colors cursor-pointer';

  return (
    <div className="min-h-screen pb-16">
      {/* Masthead */}
      <div className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-7 sm:pb-9">
          <nav aria-label="Breadcrumb" className="eyebrow text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mb-5">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/products" className="hover:text-ink">Aisles</Link>
            {(activeCategory || qParam) && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-ink">{activeCategory ? activeCategory.name : 'Search'}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl">
                {activeCategory ? activeCategory.name : qParam ? <>Results for &ldquo;{qParam}&rdquo;</> : 'Everything in the shop'}
              </h1>
              <p className="mt-3 text-[14px] text-neutral-600 dark:text-neutral-400">
                <span className="figures font-semibold text-ink">{totalCount}</span> {totalCount === 1 ? 'item' : 'items'} from verified sellers
              </p>
            </div>

            <div className="flex items-end gap-4 sm:gap-6">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-md btn-ink text-[13px] font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && <span className="size-2 rounded-full bg-marigold-300" aria-hidden="true" />}
              </button>

              {/* Columns */}
              <div className="hidden sm:block">
                <p className="eyebrow !text-[10px] text-neutral-500 mb-2">Columns</p>
                <div className="flex items-center border-[1.5px] border-ink rounded-md overflow-hidden">
                  {([2, 3, 4] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGridCols(n)}
                      title={`${n} columns`}
                      aria-pressed={gridCols === n}
                      className={`figures w-9 h-9 text-[13px] font-semibold transition-colors cursor-pointer ${
                        gridCols === n ? 'bg-ink text-paper' : 'hover:bg-ink/10'
                      } ${n > 2 ? 'border-l-[1.5px] border-ink' : ''}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <label className="block min-w-0">
                <span className="eyebrow !text-[10px] text-neutral-500 block mb-2">Sort</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="h-9 bg-transparent border-b-[1.5px] border-ink text-[13px] font-semibold text-ink focus:outline-none cursor-pointer pr-2 max-w-[11rem]"
                >
                  <option value="relevance">Our order</option>
                  <option value="price_asc">Price, low to high</option>
                  <option value="price_desc">Price, high to low</option>
                  <option value="rating_desc">Best rated</option>
                  <option value="discount_desc">Biggest discount</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-6 text-xs">
              <span className="eyebrow !text-[10px] text-neutral-500 mr-1">Filtered by</span>

              {qParam && (
                <span className={chip}>
                  “{qParam}”
                  <button onClick={() => updateFilters({ q: null })} className={chipX} aria-label="Remove search"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {categoryParam !== 'all' && activeCategory && (
                <span className={chip}>
                  {activeCategory.name}
                  <button onClick={() => updateFilters({ category: null })} className={chipX} aria-label="Remove aisle"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className={chip}>
                  <span className="figures">₹{minPriceParam || '0'} – ₹{maxPriceParam || 'any'}</span>
                  <button
                    onClick={() => { setMinPriceInput(''); setMaxPriceInput(''); updateFilters({ minPrice: null, maxPrice: null }); }}
                    className={chipX}
                    aria-label="Remove price"
                  >
                    <X className="w-3 h-3" weight="bold" />
                  </button>
                </span>
              )}
              {minRatingParam && (
                <span className={chip}>
                  {minRatingParam}★ and up
                  <button onClick={() => updateFilters({ minRating: null })} className={chipX} aria-label="Remove rating"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {minDiscountParam && (
                <span className={chip}>
                  {minDiscountParam}% off or more
                  <button onClick={() => updateFilters({ minDiscount: null })} className={chipX} aria-label="Remove discount"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {inStockParam && (
                <span className={chip}>
                  In stock
                  <button onClick={() => updateFilters({ inStock: null })} className={chipX} aria-label="Remove in stock"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {isDealParam && (
                <span className={chip}>
                  Today&apos;s deals
                  <button onClick={() => updateFilters({ isDeal: null })} className={chipX} aria-label="Remove deals"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}
              {isFeaturedParam && (
                <span className={chip}>
                  Staff picks
                  <button onClick={() => updateFilters({ isFeatured: null })} className={chipX} aria-label="Remove staff picks"><X className="w-3 h-3" weight="bold" /></button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="ml-1 text-[12px] font-semibold text-chili-600 dark:text-chili-500 underline underline-offset-4 decoration-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters + products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-x-12 gap-y-8">
          <aside className="hidden lg:block">
            <div className="sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-3 -mr-3 no-scrollbar">{filters(false)}</div>
          </aside>

          <div>
            {isLoading ? (
              <ProductGridSkeleton count={8} className={gridClass} />
            ) : products.length === 0 ? (
              <div className="max-w-lg py-10 sm:py-16">
                <p className="note text-chili-600 dark:text-chili-500 text-[1.7rem] -rotate-2 mb-3">hmm.</p>
                <h2 className="text-4xl sm:text-5xl">Nothing matches that.</h2>
                <p className="mt-4 text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Try widening the price range, taking a filter off, or searching with a simpler word.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-md btn-ink text-[13px] font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Start again
                </button>
              </div>
            ) : (
              <>
                <AnimatedGrid resetKey={products.map((p) => p.id).join(',')} className={gridClass}>
                  {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </AnimatedGrid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Pagination" className="flex items-center justify-between gap-3 mt-16 pt-6 border-t border-ink">
                    <button
                      onClick={() => updateFilters({ page: Math.max(1, pageParam - 1) })}
                      disabled={pageParam <= 1}
                      className={pageBtn}
                    >
                      <ArrowLeft className="w-4 h-4" weight="bold" /> <span className="hidden sm:inline">Previous</span>
                    </button>
                    <ul className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p}>
                          <button
                            onClick={() => updateFilters({ page: p })}
                            aria-current={pageParam === p ? 'page' : undefined}
                            className={`figures min-w-9 h-9 px-2 text-[14px] cursor-pointer transition-colors ${
                              pageParam === p
                                ? 'font-bold underline decoration-[3px] decoration-marigold-400 underline-offset-[7px]'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-ink'
                            }`}
                          >
                            {p}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => updateFilters({ page: Math.min(totalPages, pageParam + 1) })}
                      disabled={pageParam >= totalPages}
                      className={pageBtn}
                    >
                      <span className="hidden sm:inline">Next</span> <ArrowRight className="w-4 h-4" weight="bold" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-neutral-950/55" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-sm w-[90%] bg-paper border-l-[1.5px] border-ink z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-5 h-16 border-b border-rule shrink-0">
              <h3 className="font-display text-2xl">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="grid place-items-center size-10 rounded-md hover:bg-ink/[0.07] cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filters(true)}</div>
            <div className="px-5 py-4 border-t border-rule shrink-0">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full h-11 rounded-md btn-ink text-[13px] font-semibold cursor-pointer"
              >
                Show {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center eyebrow text-neutral-500">Loading the shelves…</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
