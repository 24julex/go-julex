import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { Heart, ShoppingBag } from 'lucide-react';

export const WatchCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useCart();
  const { finalPrice } = calculateDiscount(product.price, product.discountPercent);
  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = (Number(product.stockQuantity ?? product.stock ?? 0) <= 0) || product.status === 'No' || product.status === false || product.available === false;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart!`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    showToast(isFavorited ? `Removed from wishlist.` : `Saved to wishlist!`);
  };

  return (
    <div
      className="group rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-xl relative"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)',
        color: 'var(--text-primary)'
      }}
    >
      <div>
        {/* Thumbnail & Badges */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3.5 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
          <img
            src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount & 0% Fee Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.discountPercent > 0 && (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-black shadow-md font-mono"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition cursor-pointer"
            style={isFavorited ? { backgroundColor: '#E11D48', color: '#FFF' } : { backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF' }}
            title={isFavorited ? 'Remove Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Brand & Category */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold uppercase tracking-widest truncate max-w-[140px]" style={{ color: 'var(--accent)' }}>
              {product.brand}
            </span>
            <span className="truncate max-w-[110px]" style={{ color: 'var(--text-muted)' }}>
              {product.category}
            </span>
          </div>

          {/* Product Title */}
          <Link
            to={product.storeSubdomain ? `/store/${product.storeSubdomain}/product/${product.id}` : `/product/${product.id}`}
            className="font-sans font-semibold text-xs transition-colors line-clamp-2 block"
            style={{ color: 'var(--text-primary)' }}
            title={product.name}
          >
            {product.name}
          </Link>
        </div>
      </div>

      {/* Price & Add to Cart Footer */}
      <div className="pt-3 border-t flex items-end justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm sm:text-base font-bold" style={{ color: 'var(--accent)' }}>
              {formatCurrency(finalPrice)}
            </span>
            {product.discountPercent > 0 && (
              <span className="font-mono text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-emerald-500 font-bold block">
            0% Platform Markup
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`p-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'text-black hover:scale-105 active:scale-95 shadow-md'
          }`}
          style={!isOutOfStock ? { backgroundColor: 'var(--accent)' } : { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
