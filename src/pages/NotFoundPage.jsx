import React from 'react';
import { Link } from 'react-router-dom';
import { Watch, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 mx-auto flex items-center justify-center">
          <Watch className="w-8 h-8 text-gold-400" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">404 Error</span>
          <h1 className="font-serif text-3xl font-bold text-white">Timepiece Not Found</h1>
          <p className="text-sm text-slate-400">
            The page or horological reference you are seeking does not exist or has been relocated.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-obsidian-950 font-bold text-xs hover:bg-gold-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Boutique
          </Link>
        </div>
      </div>
    </div>
  );
};
