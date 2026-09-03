import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  Code,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileCode
} from 'lucide-react';

export const ThemeSandboxModal = ({ theme, isOpen, onClose }) => {
  const [viewport, setViewport] = useState('desktop');
  const [mockVertical, setMockVertical] = useState('jewelry');
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen || !theme) return null;

  const mockFeeds = {
    jewelry: {
      title: 'Aura Fine Jewellery & Solitaires',
      heroImage:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      headline: 'Artisanal Brilliance In Pure 22K Gold',
      products: [
        {
          name: 'Royal Heritage Kundan Choker',
          price: '₹2,45,000',
          img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'Rose Gold Solitaire Diamond Ring',
          price: '₹1,25,000',
          img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80'
        },
        {
          name: '925 Sterling Silver Tribal Anklets',
          price: '₹6,800',
          img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80'
        }
      ]
    },
    shoes: {
      title: 'SoleStep Velocity Streetwear',
      heroImage:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      headline: 'AeroGlide Ultra Carbon Running Shoes',
      products: [
        {
          name: 'AeroGlide Pro Marathon Shoes',
          price: '₹8,499',
          img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'Urban Retro Street High-Tops',
          price: '₹5,299',
          img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'CloudFoam Slip-on Daily Walkers',
          price: '₹3,199',
          img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80'
        }
      ]
    }
  };

  const currentMock = mockFeeds[mockVertical] || mockFeeds.jewelry;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl h-[92vh] bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Sandbox Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3.5 border-b border-[#FBCBCB] bg-white gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#0F172A] font-serif">{theme.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
                  {theme.version} Sandbox
                </span>
              </div>
              <p className="text-[10px] text-[#374151]">{theme.vertical}</p>
            </div>
          </div>

          {/* Viewport switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white p-1 rounded-2xl border border-[#FBCBCB]">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-xl transition ${
                  viewport === 'desktop' ? 'bg-[#9F1239] text-white shadow-xs' : 'text-[#881337]'
                }`}
                title="Desktop View"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-xl transition ${
                  viewport === 'tablet' ? 'bg-[#9F1239] text-white shadow-xs' : 'text-[#881337]'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-xl transition ${
                  viewport === 'mobile' ? 'bg-[#9F1239] text-white shadow-xs' : 'text-[#881337]'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowJsonDrawer(!showJsonDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-bold text-[#881337]"
            >
              <Code className="w-3.5 h-3.5" /> Schema JSON
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-2xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sandbox Canvas Area */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-white">
          {/* Simulated Device Frame */}
          <div
            className={`h-full bg-white rounded-2xl shadow-xl border border-[#FBCBCB] overflow-y-auto transition-all duration-300 flex flex-col ${
              viewport === 'desktop'
                ? 'w-full'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
            style={{
              backgroundColor: theme.tokens?.backgroundColor || '#FFF1F2',
              fontFamily: theme.tokens?.bodyFont || 'Inter'
            }}
          >
            {/* Storefront Announcement Bar */}
            <div
              className="py-2 px-4 text-center text-xs font-medium"
              style={{
                backgroundColor: theme.tokens?.primaryAccent || '#BE123C',
                color: '#FFFFFF'
              }}
            >
              🎉 Festive Sale • Free Insured Delivery Nationwide on All Orders
            </div>

            {/* Storefront Nav Header */}
            <div className="py-4 px-6 border-b border-[#FBCBCB]/60 flex items-center justify-between">
              <h2
                className="font-bold text-lg"
                style={{
                  color: theme.tokens?.headingColor || '#0F172A',
                  fontFamily: theme.tokens?.headingFont || 'Playfair Display'
                }}
              >
                {currentMock.title}
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-[#374151]">
                <span>Collections</span>
                <span>Best Sellers</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Hero Banner Section */}
            <div className="relative aspect-[21/9] overflow-hidden bg-stone-100 flex items-center justify-center">
              <img
                src={currentMock.heroImage}
                alt="Hero banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0F172A]/30 flex flex-col items-center justify-center text-center p-6 text-white space-y-2">
                <h1
                  className="text-2xl sm:text-3xl font-black max-w-lg"
                  style={{ fontFamily: theme.tokens?.headingFont || 'Playfair Display' }}
                >
                  {currentMock.headline}
                </h1>
                <button
                  className={`px-5 py-2 text-xs font-bold text-white shadow-md ${
                    theme.tokens?.buttonRadius || 'rounded-2xl'
                  }`}
                  style={{ backgroundColor: theme.tokens?.primaryAccent || '#BE123C' }}
                >
                  Explore Collection
                </button>
              </div>
            </div>

            {/* Featured Product Grid */}
            <div className="p-6 space-y-4">
              <h3
                className="text-base font-bold"
                style={{
                  color: theme.tokens?.headingColor || '#0F172A',
                  fontFamily: theme.tokens?.headingFont || 'Playfair Display'
                }}
              >
                Curated New Arrivals
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentMock.products.map((prod, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border border-[#FBCBCB] shadow-xs flex flex-col justify-between ${
                      theme.tokens?.buttonRadius || 'rounded-2xl'
                    }`}
                    style={{ backgroundColor: theme.tokens?.surfaceColor || '#FFFFFF' }}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-white mb-2">
                      <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4
                        className="font-bold text-xs"
                        style={{ color: theme.tokens?.headingColor || '#0F172A' }}
                      >
                        {prod.name}
                      </h4>
                      <p
                        className="font-bold font-mono text-xs"
                        style={{ color: theme.tokens?.primaryAccent || '#BE123C' }}
                      >
                        {prod.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JSON Schema Drawer */}
          {showJsonDrawer && (
            <div className="absolute top-0 right-0 bottom-0 w-96 bg-white border-l border-[#FBCBCB] shadow-2xl p-4 flex flex-col z-20 animate-slide-left text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#FBCBCB]">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold">
                  <FileCode className="w-4 h-4 text-[#9F1239]" /> Theme Token Schema JSON
                </div>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] text-[11px] font-bold transition flex items-center gap-1"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedJson ? 'Copied' : 'Copy'}
                </button>
              </div>

              <pre className="flex-1 overflow-y-auto p-3 mt-3 bg-white border border-[#FBCBCB] rounded-2xl font-mono text-[10px] text-[#0F172A] leading-relaxed select-all">
                {JSON.stringify(theme, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
