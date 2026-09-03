import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { WatchCard } from '../../components/customer/WatchCard';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-gold-400">
            Personal Curation
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Saved Timepieces ({wishlist.length})
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep track of timepieces you are considering adding to your private collection.
          </p>
        </div>

        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition"
        >
          <ShoppingBag className="w-4 h-4" /> Browse Full Vault <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white">Your Wishlist is Empty</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click the heart icon on any timepiece in our catalogue to curate your personal acquisition shortlist.
          </p>
          <div className="pt-2">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-obsidian-950 font-bold text-xs hover:bg-gold-400 transition"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((watch) => (
            <WatchCard key={watch.id} product={watch} />
          ))}
        </div>
      )}
    </div>
  );
};
