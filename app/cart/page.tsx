'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/context/CartContext';
import { useWishlist } from '@/src/context/WishlistContext';
import { useToast } from '@/src/context/ToastContext';
import { Trash2, Heart, Plus, Minus, ArrowRight } from '@/src/components/ui/icons';
import { Arrow } from '@/src/components/ui/Hand';
import { formatINR } from '@/src/lib/date';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { toggleWishlist } = useWishlist();
  const { success, error } = useToast();

  const handleQtyChange = async (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeItem(itemId);
      success('Item removed from cart');
    } else {
      try {
        await updateQuantity(itemId, newQty);
      } catch (err: unknown) {
        const errObj = err as Error;
        error(errObj.message || 'Could not update quantity');
      }
    }
  };

  const handleMoveToWishlist = async (productId: number, itemId: number) => {
    try {
      await toggleWishlist(productId);
      await removeItem(itemId);
      success('Item saved to your Wishlist');
    } catch {
      error('Failed to move to wishlist');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      success('Cart cleared');
    } catch {
      error('Could not clear cart');
    }
  };

  const progressPercent = Math.min(100, Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100));

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center p-6 pb-24">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="eyebrow text-neutral-500 mb-5">Your cart</p>
            <h2 className="text-[3rem] sm:text-7xl leading-[0.98]">
              Nothing in here <span className="text-gradient">yet</span>.
            </h2>
            <p className="mt-5 text-[16px] text-neutral-700 dark:text-neutral-300 max-w-md leading-relaxed">
              Add a few things and they will wait here for you. Today&apos;s deals are a good place to start.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-md btn-ink text-[15px] font-semibold"
              >
                Go and have a look
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
              <Link
                href="/products?isDeal=true"
                className="text-[15px] font-semibold underline decoration-2 decoration-chili-500 underline-offset-[6px] hover:decoration-ink"
              >
                Today&apos;s deals
              </Link>
            </div>
          </div>
          {/* an empty basket, drawn with a few strokes */}
          <div className="md:col-span-5 hidden md:grid place-items-center text-ink/80 relative">
            <svg viewBox="0 0 240 200" fill="none" className="w-full max-w-[320px]" aria-hidden="true">
              <path d="M40 80h160l-14 82a14 14 0 0 1-14 12H68a14 14 0 0 1-14-12L40 80Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M82 80c0-26 16-44 38-44s38 18 38 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M88 108v36M120 108v36M152 108v36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
              <path d="M26 196c30-6 62-4 94-2s64 4 94-2" stroke="var(--color-marigold-400)" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span className="note absolute top-2 right-4 text-chili-600 dark:text-chili-500 rotate-6 text-[1.6rem]">empty!</span>
            <Arrow className="absolute top-8 right-24 w-12 h-8 text-chili-600 dark:text-chili-500 rotate-[160deg]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14">
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-12 pb-5 border-b border-ink">
          <div>
            <p className="eyebrow text-neutral-500 mb-3">Your cart</p>
            <h1 className="text-[2.6rem] sm:text-6xl">What you&apos;re taking home</h1>
            <p className="text-[14px] text-neutral-600 dark:text-neutral-400 mt-3">
              <span className="figures font-semibold text-ink">{cart.totalItems}</span> {cart.totalItems === 1 ? 'item' : 'items'} in your basket
            </p>
          </div>
          <button
            onClick={handleClear}
            className="shrink-0 text-[13px] font-semibold text-chili-600 dark:text-chili-500 underline underline-offset-4 decoration-2 cursor-pointer"
          >
            Empty the cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Items, as lines on a list */}
          <div className="lg:col-span-8">
            {/* Free-delivery progress */}
            <div className="pb-6 mb-2 border-b border-rule">
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                {cart.freeDeliveryRemaining > 0 ? (
                  <p>
                    Add <strong className="figures font-semibold">{formatINR(cart.freeDeliveryRemaining)}</strong> more and delivery is <strong className="font-semibold">free</strong>.
                  </p>
                ) : (
                  <p className="font-semibold text-brand-700 dark:text-brand-300">Delivery is free on this order.</p>
                )}
                <span className="figures text-[12px] text-neutral-500 shrink-0">{progressPercent}%</span>
              </div>
              <div className="relative mt-3 h-2 border-[1.5px] border-ink rounded-[3px] overflow-hidden bg-card">
                <div
                  className={`h-full transition-all duration-500 ${cart.freeDeliveryRemaining > 0 ? 'bg-marigold-400' : 'bg-brand-600'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <ul className="divide-y divide-rule">
              {cart.items.map((item) => (
                <li key={item.id} className="py-6 flex gap-4 sm:gap-7">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative w-24 h-28 sm:w-32 sm:h-40 rounded-md bg-neutral-200 dark:bg-neutral-800 border border-rule shrink-0 overflow-hidden"
                  >
                    <Image
                      src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80'}
                      alt={item.productName}
                      fill
                      sizes="128px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="eyebrow !text-[10px] text-neutral-600 dark:text-neutral-400">{item.brand}</span>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="block text-[15px] sm:text-[17px] font-medium leading-snug hover:underline underline-offset-4 decoration-marigold-400 decoration-2 line-clamp-2 mt-1.5"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400 mt-1.5">
                            Option: <span className="font-semibold text-ink">{item.variantName}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="figures block text-base sm:text-lg font-semibold">{formatINR(item.itemTotal)}</span>
                        {item.basePrice > item.unitPrice && (
                          <span className="figures block text-[12px] text-neutral-500 line-through">{formatINR(item.basePrice * item.quantity)}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[12.5px] text-neutral-600 dark:text-neutral-400 mt-2">
                      Arrives <span className="font-semibold text-ink">{item.deliveryInfo.dateString}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-auto">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="inline-flex items-center border-[1.5px] border-ink rounded-md overflow-hidden bg-card">
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                            disabled={isLoading}
                            aria-label="Decrease quantity"
                            className="grid place-items-center w-9 h-9 hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" weight="bold" />
                          </button>
                          <span className="figures text-sm font-semibold min-w-9 text-center border-x-[1.5px] border-ink h-9 grid place-items-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                            disabled={isLoading || item.quantity >= item.stockAvailable}
                            aria-label="Increase quantity"
                            className="grid place-items-center w-9 h-9 hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" weight="bold" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleMoveToWishlist(item.productId, item.id)}
                          className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-ink flex items-center gap-1.5 underline-offset-4 hover:underline decoration-2 decoration-marigold-400 cursor-pointer"
                        >
                          <Heart className="w-4 h-4" /> <span className="hidden sm:inline">Save for later</span>
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[13px] font-medium text-chili-600 dark:text-chili-500 flex items-center gap-1.5 underline-offset-4 hover:underline decoration-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span><span className="sm:hidden sr-only">Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Receipt */}
          <aside className="lg:col-span-4 lg:sticky lg:top-44">
            <div className="receipt border border-rule px-6 pt-7 pb-8 sm:px-7 -rotate-[0.6deg]">
              <p className="eyebrow text-center text-neutral-500">QazvuCart · order summary</p>
              <p className="text-center font-display text-3xl mt-2">Your receipt</p>
              <div className="border-t-2 border-dashed border-ink/30 my-5" />

              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-700 dark:text-neutral-300">Items ({cart.totalItems})</dt>
                  <dd className="figures">{formatINR(cart.totalOriginalPrice || cart.subtotal)}</dd>
                </div>

                {cart.totalDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-brand-700 dark:text-brand-300 font-medium">
                    <dt>Discount</dt>
                    <dd className="figures">− {formatINR(cart.totalDiscount)}</dd>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-700 dark:text-neutral-300">Delivery</dt>
                  <dd className="figures">
                    {cart.deliveryFee === 0 ? <span className="font-semibold text-brand-700 dark:text-brand-300">Free</span> : formatINR(cart.deliveryFee)}
                  </dd>
                </div>
              </dl>

              <div className="border-t-2 border-dashed border-ink/30 my-5" />

              <div className="flex justify-between items-baseline gap-4">
                <span className="eyebrow text-ink">Total</span>
                <span className="figures text-[2rem] font-semibold">{formatINR(cart.grandTotal)}</span>
              </div>

              {cart.totalDiscount > 0 && (
                <p className="note text-[1.35rem] text-chili-600 dark:text-chili-500 text-center mt-4 -rotate-1">
                  you&apos;re saving {formatINR(cart.totalDiscount)}!
                </p>
              )}

              <button
                onClick={() => router.push('/checkout')}
                className="group mt-6 w-full h-12 px-6 rounded-md btn-ink font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
              </button>

              <p className="mt-5 text-center text-[11.5px] text-neutral-600 dark:text-neutral-400">
                Safe, encrypted payment · Original products
              </p>
            </div>

            <ul className="mt-8 space-y-3 text-[13px] text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-3">
                <span className="figures text-chili-600 dark:text-chili-500 text-[11px] pt-0.5">01</span>
                <span><strong className="font-semibold text-ink">Cancel free</strong> any time before it ships.</span>
              </li>
              <li className="flex gap-3">
                <span className="figures text-chili-600 dark:text-chili-500 text-[11px] pt-0.5">02</span>
                <span><strong className="font-semibold text-ink">Seven-day replacement</strong> if it arrives damaged or wrong.</span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
