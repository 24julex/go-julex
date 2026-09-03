import React, { useState } from 'react';
import {
  X,
  Palette,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Globe,
  Sliders,
  Type,
  CheckCircle2,
  FileCode,
  Rocket
} from 'lucide-react';

export const CreateThemeModal = ({ isOpen, onClose, onSaveTheme }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Gifts & Beauty');
  const [targetVertical, setTargetVertical] = useState('Beauty, Cosmetics & Modern Jewelry');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'
  );
  const [tierAccess, setTierAccess] = useState('free');
  const [priceINR, setPriceINR] = useState(1999);

  // Step 2: Default Design Tokens
  const [headingFont, setHeadingFont] = useState('Playfair Display');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [primaryAccent, setPrimaryAccent] = useState('#BE123C');
  const [backgroundColor, setBackgroundColor] = useState('#FFF1F2');
  const [surfaceColor, setSurfaceColor] = useState('#FFFFFF');
  const [headingColor, setHeadingColor] = useState('#0F172A');
  const [buttonRadius, setButtonRadius] = useState('rounded-2xl');

  // Step 3: Allowed Component Blocks Schema
  const [allowedBlocks, setAllowedBlocks] = useState({
    announcement_bar: true,
    navigation_header: true,
    hero_slider: true,
    featured_collection: true,
    multi_column_grid: true,
    vertical_customization: true,
    video_reels: true,
    testimonials: true,
    faq_accordion: true,
    footer: true
  });

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const toggleBlock = (blockKey) => {
    setAllowedBlocks((prev) => ({
      ...prev,
      [blockKey]: !prev[blockKey]
    }));
  };

  const handleFinish = () => {
    const newMasterTheme = {
      id: `theme_${Date.now()}`,
      name: name || 'Custom Master Theme',
      slug: slug || 'custom-master-theme',
      vertical: targetVertical,
      category,
      version: 'v1.0.0',
      tierAccess,
      priceINR: tierAccess === 'paid' ? priceINR : 0,
      isPublished: true,
      activeInstalls: 0,
      thumbnail: thumbnailUrl,
      tagline:
        tagline ||
        'Master storefront layout crafted for high-conversion multi-channel retail with 0% fee platform architecture.',
      tokens: {
        headingFont,
        bodyFont,
        primaryAccent,
        backgroundColor,
        surfaceColor,
        headingColor,
        buttonRadius
      },
      allowedBlocks
    };

    onSaveTheme(newMasterTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FBCBCB] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-serif">
                Master Theme Creation Studio
              </h2>
              <p className="text-[11px] text-[#374151]">
                Define design tokens, typography, block schemas, and distribution rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-[#FBCBCB] bg-[#fedddd]/60 text-[11px] font-bold text-center">
          {[
            { num: 1, label: '1. Basic Info' },
            { num: 2, label: '2. Design Tokens' },
            { num: 3, label: '3. Blocks Schema' },
            { num: 4, label: '4. Review & Push' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`py-2.5 border-b-2 cursor-pointer transition ${
                currentStep === s.num
                  ? 'border-[#BE123C] text-[#0F172A] bg-white'
                  : currentStep > s.num
                  ? 'border-emerald-600 text-emerald-800 bg-white/30'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs bg-white">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Theme Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Celestial Diamond Gold"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-bold focus:outline-none focus:border-[#BE123C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">System Slug Identifier</label>
                  <input
                    type="text"
                    value={slug}
                    readOnly
                    placeholder="theme-celestial-diamond"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#881337] font-mono text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A]">Description / Tagline</label>
                <textarea
                  rows="2"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Opulent bridal aesthetic with high-resolution gemstone zoom and certificate trust badges."
                  className="w-full px-3.5 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Category Niche</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  >
                    <option value="Gifts & Beauty">Gifts & Beauty</option>
                    <option value="Jewelry & Luxury">Jewelry & Luxury</option>
                    <option value="Footwear & Streetwear">Footwear & Streetwear</option>
                    <option value="Organic & Millets">Organic & Millets</option>
                    <option value="Universal">Universal Multi-Store</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Target Retail Vertical</label>
                  <input
                    type="text"
                    value={targetVertical}
                    onChange={(e) => setTargetVertical(e.target.value)}
                    placeholder="e.g. Fine Jewelry, Polki & Diamonds"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A]">Cover Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs focus:outline-none focus:border-[#BE123C]"
                  />
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#FBCBCB] shrink-0 bg-white">
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#FBCBCB]">
                <div
                  onClick={() => setTierAccess('free')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    tierAccess === 'free'
                      ? 'border-[#BE123C] bg-white'
                      : 'border-[#FBCBCB] bg-white'
                  }`}
                >
                  <span className="font-bold text-xs text-[#0F172A] block">🟢 Standard (Free)</span>
                  <span className="text-[10px] text-[#374151]">Available to all tenants</span>
                </div>

                <div
                  onClick={() => setTierAccess('pro')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    tierAccess === 'pro'
                      ? 'border-[#BE123C] bg-white'
                      : 'border-[#FBCBCB] bg-white'
                  }`}
                >
                  <span className="font-bold text-xs text-[#881337] block">🔵 Pro Exclusive</span>
                  <span className="text-[10px] text-[#374151]">Included in Pro/Enterprise plans</span>
                </div>

                <div
                  onClick={() => setTierAccess('paid')}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    tierAccess === 'paid'
                      ? 'border-[#BE123C] bg-white'
                      : 'border-[#FBCBCB] bg-white'
                  }`}
                >
                  <span className="font-bold text-xs text-[#9F1239] block">🟣 Paid Marketplace</span>
                  <span className="text-[10px] text-[#374151]">One-time template purchase fee</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Design Tokens */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Display / Heading Font</label>
                  <select
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  >
                    <option value="Playfair Display">Playfair Display (Luxury & Bridal)</option>
                    <option value="Cinzel">Cinzel (Regal Jewelry)</option>
                    <option value="Space Grotesk">Space Grotesk (Streetwear & Sneakers)</option>
                    <option value="Outfit">Outfit (Clean & Modern Organic)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS & High-Tech)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Body Typography</label>
                  <select
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="DM Sans">DM Sans</option>
                  </select>
                </div>
              </div>

              {/* Color Token Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A] text-[11px]">Primary Brand Accent</label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#FBCBCB]">
                    <input
                      type="color"
                      value={primaryAccent}
                      onChange={(e) => setPrimaryAccent(e.target.value)}
                      className="w-7 h-7 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-[#0F172A]">{primaryAccent}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A] text-[11px]">Canvas Background</label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#FBCBCB]">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-7 h-7 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-[#0F172A]">{backgroundColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A] text-[11px]">Card Surface</label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#FBCBCB]">
                    <input
                      type="color"
                      value={surfaceColor}
                      onChange={(e) => setSurfaceColor(e.target.value)}
                      className="w-7 h-7 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-[#0F172A]">{surfaceColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A] text-[11px]">Headings Text</label>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#FBCBCB]">
                    <input
                      type="color"
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                      className="w-7 h-7 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-[#0F172A]">{headingColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Allowed Component Blocks */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-[#374151]">
                Select the pre-built visual storefront component blocks supported by this theme schema:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(allowedBlocks).map(([blockKey, isEnabled]) => (
                  <div
                    key={blockKey}
                    onClick={() => toggleBlock(blockKey)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isEnabled
                        ? 'border-[#BE123C] bg-white'
                        : 'border-[#FBCBCB] bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#9F1239]" />
                      <span className="font-bold capitalize text-xs text-[#0F172A]">
                        {blockKey.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isEnabled ? 'bg-[#9F1239] text-white' : 'bg-stone-200 text-slate-500'
                      }`}
                    >
                      {isEnabled ? <Check className="w-3 h-3 stroke-[3]" /> : '–'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Push */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={thumbnailUrl}
                      alt={name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#FBCBCB]"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] font-serif">{name || 'Unnamed Theme'}</h3>
                      <p className="text-[11px] text-[#374151]">{targetVertical}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
                    {tierAccess.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#FBCBCB] text-[11px]">
                  <div>
                    <span className="text-[#374151] block">Heading Font</span>
                    <strong className="text-[#0F172A]">{headingFont}</strong>
                  </div>
                  <div>
                    <span className="text-[#374151] block">Body Font</span>
                    <strong className="text-[#0F172A]">{bodyFont}</strong>
                  </div>
                  <div>
                    <span className="text-[#374151] block">Accent Color</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryAccent }} />
                      <strong className="text-[#0F172A]">{primaryAccent}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#374151] block">Enabled Blocks</span>
                    <strong className="text-[#0F172A]">
                      {Object.values(allowedBlocks).filter(Boolean).length} Blocks
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#FBCBCB] bg-white">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] font-bold text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition"
            >
              Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition transform active:scale-95"
            >
              <Rocket className="w-4 h-4" /> Publish & Distribute Master Theme
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
