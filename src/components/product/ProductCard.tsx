'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/src/context/CartContext';
import { useWishlist } from '@/src/context/WishlistContext';
import { useToast } from '@/src/context/ToastContext';
import { Heart, Star, ShoppingBag, Truck, Eye, Check } from '@/src/components/ui/icons';
import { formatINR } from '@/src/lib/date';
import { flyToCart } from '@/src/lib/flyToCart';
import { QuickViewModal } from '@/src/components/product/QuickViewModal';

export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  brand: string;
  categoryName?: string;
  basePrice: number;
  discountPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  primaryImage: string;
  inStock: boolean;
  stock?: number;
  deliveryInfo?: {
    dateString: string;
    formattedDate: string;
  };
  isDeal?: boolean;
  /** `feature` is the big editorial treatment used once on the home page. */
  variant?: 'default' | 'feature';
}

/**
 * A product, laid out like an entry in a printed catalogue: the photo on its
 * own, a caption underneath, the price in mono. No box, no shadow; the only
 * "decoration" is a tilted sticker when something is on offer.
 */
export function ProductCard({
  id,
  name,
  slug,
  brand,
  categoryName,
  basePrice,
  discountPrice,
  discountPercent,
  rating,
  reviewCount,
  primaryImage,
  inStock,
  deliveryInfo,
  isDeal,
  variant = 'default',
}: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error } = useToast();
  const imageRef = useRef<HTMLDivElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isFav = isInWishlist(id);
  const feature = variant === 'feature';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = await toggleWishlist(id);
      success(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch {
      error('Please sign in to save wishlist items');
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    try {
      await addToCart(id, null, 1);
      if (imageRef.current) flyToCart(imageRef.current, validImage);
      success(`Added ${name} to cart`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    } catch (err: unknown) {
      const errObj = err as Error;
      error(errObj.message || 'Please sign in to add to cart');
    }
  };

  const validImage =
    typeof primaryImage === 'string' && primaryImage.trim()
      ? primaryImage.trim()
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80';

  const hasRating = rating > 0 && reviewCount > 0;

  return (
    <article className="group relative flex flex-col h-full">
      {/* Photo */}
      <div
        ref={imageRef}
        className={`relative w-full rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-rule shrink-0 ${
          feature ? 'aspect-[4/5]' : 'aspect-[4/5]'
        }`}
      >
        <Link href={`/products/${slug}`} className="block w-full h-full" aria-label={name}>
          <Image
            src={validImage}
            alt={name}
            fill
            sizes={feature ? '(max-width: 1024px) 100vw, 40vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Stickers */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="sticker sticker-chili">−{discountPercent}%</span>
          )}
          {isDeal && (
            <span className="sticker !rotate-2">Today only</span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          onClick={handleWishlistToggle}
          whileTap={{ scale: 0.88 }}
          className={`absolute top-2.5 right-2.5 z-10 grid place-items-center w-8 h-8 rounded-md bg-paper/95 border border-rule transition-colors cursor-pointer ${
            isFav ? 'text-chili-600' : 'text-ink hover:text-chili-600'
          }`}
          aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isFav}
        >
          <Heart className="w-[16px] h-[16px]" weight={isFav ? 'fill' : 'regular'} />
        </motion.button>

        {/* Quick look */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickViewOpen(true);
          }}
          className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-1.5 h-9 bg-ink text-paper text-[12px] font-semibold translate-y-full group-hover:translate-y-0 focus-visible:translate-y-0 transition-transform duration-300 ease-out max-sm:hidden cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> Quick look
        </button>

        {!inStock && (
          <div className="absolute inset-0 bg-paper/70 grid place-items-center z-10">
            <span className="eyebrow border-2 border-ink text-ink px-3 py-2 -rotate-6 bg-paper">Sold out</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="pt-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="eyebrow !text-[10px] text-neutral-600 dark:text-neutral-400 truncate">{brand}</span>
          {categoryName && (
            <span className="text-[11px] text-neutral-500 truncate shrink-0 max-w-[45%] hidden sm:block">{categoryName}</span>
          )}
        </div>

        <Link
          href={`/products/${slug}`}
          className={`block text-ink hover:underline underline-offset-4 decoration-marigold-400 decoration-2 line-clamp-2 ${
            feature
              ? 'font-display text-2xl sm:text-[1.9rem] leading-[1.1] min-h-[3.2rem]'
              : 'text-[14px] sm:text-[15px] font-medium leading-snug min-h-[2.5rem] sm:min-h-[2.6rem]'
          }`}
        >
          {name}
        </Link>

        {hasRating && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400">
            <Star className="w-3 h-3 text-marigold-500" weight="fill" />
            <span className="figures font-semibold text-ink">{rating.toFixed(1)}</span>
            <span className="figures">({reviewCount})</span>
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-2">
            <p className="flex items-baseline gap-x-2 flex-wrap min-w-0">
              <span className={`figures font-semibold text-ink ${feature ? 'text-2xl' : 'text-[17px]'}`}>
                {formatINR(discountPrice)}
              </span>
              {basePrice > discountPrice && (
                <span className="figures text-[12px] text-neutral-500 line-through">{formatINR(basePrice)}</span>
              )}
            </p>

            <button
              onClick={handleQuickAdd}
              disabled={!inStock || isLoading}
              aria-label={inStock ? `Add ${name} to cart` : 'Out of stock'}
              title={inStock ? 'Add to cart' : 'Out of stock'}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border-[1.5px] text-[12px] font-semibold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px cursor-pointer ${
                justAdded
                  ? 'bg-brand-800 border-brand-800 text-white'
                  : 'border-ink text-ink hover:bg-ink hover:text-paper'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4" weight="bold" /> Added
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" /> Add
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {deliveryInfo && (
            <p className="mt-2 text-[11.5px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 truncate">
              <Truck className="w-3.5 h-3.5 text-brand-700 dark:text-brand-300 shrink-0" />
              <span className="truncate">
                Arrives <span className="font-semibold text-ink">{deliveryInfo.dateString}</span>
              </span>
            </p>
          )}
        </div>
      </div>

      {isQuickViewOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <QuickViewModal key={slug} slug={slug} onClose={() => setIsQuickViewOpen(false)} />,
          document.body
        )}
    </article>
  );
}
