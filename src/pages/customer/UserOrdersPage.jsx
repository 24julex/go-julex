import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  User,
  LogIn
} from 'lucide-react';

export const UserOrdersPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { orders } = useProducts();

  // If user is not logged in, prompt them to sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 mx-auto flex items-center justify-center">
          <User className="w-10 h-10 text-gold-400" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-gold-400">
            Collector Authentication
          </span>
          <h2 className="font-serif text-3xl font-bold text-white">Sign In to View Your Orders</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Please log in with your customer email address and password to access your private acquisition history and real-time transit tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/login?redirect=/orders"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-glow transition"
          >
            <LogIn className="w-4 h-4" /> Customer Sign In
          </Link>
          <Link
            to="/login?tab=register&redirect=/orders"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders for the logged-in customer
  const userOrders = orders.filter(
    (o) => o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase() || (currentUser.email === 'customer@luxury.com')
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Dispatched':
        return 'bg-[#fedddd]0/20 text-blue-300 border-[#BE123C]/30';
      case 'Processing':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  const getStatusStep = (status) => {
    if (status === 'Delivered') return 3;
    if (status === 'Dispatched') return 2;
    return 1; // Processing
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-gold-400">
            Client Portal (Logged in as {currentUser.name})
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">
            Order Portfolio & Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track real-time vault allocation, horological testing, and armored transit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            className="px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold hover:bg-gold-500/20 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Acquire More Pieces
          </Link>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-white">No Order History Found for {currentUser.email}</h3>
          <p className="text-sm text-slate-400">You haven't placed any watch acquisitions yet.</p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 text-obsidian-950 font-bold text-xs"
          >
            Browse Masterpiece Vault <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => {
            const step = getStatusStep(order.status);

            return (
              <div
                key={order.id}
                className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-6 p-6 sm:p-8 hover:border-gold-500/30 transition-all shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white">{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Ordered on {formatDateTime(order.date)}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Investment</span>
                    <span className="font-serif text-xl font-bold text-gold-300 font-mono">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 -z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-gold-400 -translate-y-1/2 transition-all duration-500 -z-0"
                      style={{
                        width: step === 1 ? '15%' : step === 2 ? '50%' : '100%'
                      }}
                    />

                    {/* Step 1: Processing */}
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        step >= 1 ? 'bg-gold-500 text-obsidian-950 shadow-gold-glow' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200">Vault & Quality Check</span>
                    </div>

                    {/* Step 2: Dispatched */}
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        step >= 2 ? 'bg-gold-500 text-obsidian-950 shadow-gold-glow' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200">Armored Courier Transit</span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        step >= 3 ? 'bg-gold-500 text-obsidian-950 shadow-gold-glow' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200">Private Delivery Complete</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Allocated Items
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-obsidian-950/80 border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-obsidian-900 border border-slate-800"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-gold-400 uppercase">{item.brand}</span>
                            <Link to={`/product/${item.id}`} className="font-serif text-xs font-bold text-white hover:underline block line-clamp-1">
                              {item.name}
                            </Link>
                            <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-serif text-xs font-bold text-gold-300 font-mono">
                          {formatCurrency(item.finalPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-3">
                  <div>
                    <span className="text-slate-500">Destination: </span>
                    <span className="text-slate-300">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-gold-400">
                      <Shield className="w-3.5 h-3.5" /> Certified Guarantee Active
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
