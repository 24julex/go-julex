import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  IndianRupee,
  ShieldCheck,
  Globe,
  MessageSquare,
  Instagram,
  Store,
  Tag,
  Check,
  Video,
  X,
  Percent,
  AlertCircle,
  HelpCircle,
  Eye,
  FileText,
  Sliders,
  Users
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';

export const UNIVERSAL_CATEGORIES = [
  'Books & Literature',
  'Jewelry & Accessories',
  'Fashion & Apparel',
  'Footwear',
  'Millets & Organic Foods',
  'Gifts & Crafts',
  'Toys & Games',
  'Home & Living',
  'Beauty & Personal Care',
  'Electronics & Gadgets'
];

export const CATEGORY_SUBCATEGORIES_MAP = {
  'Books & Literature': [
    'Biography & Memoirs',
    'Self-Help & Motivation',
    'Fiction & Literature',
    'Business & Economics',
    'History & Politics',
    'Science & Technology',
    'Poetry & Philosophy',
    'Children & Young Adult'
  ],
  'Jewelry & Accessories': [
    'Necklaces & Chokers',
    'Rings & Bands',
    'Earrings & Studs',
    'Bracelets & Bangles',
    'Pendants & Lockets',
    'Fine Horology & Watches',
    'Brooches & Lapel Pins',
    'Anklets & Payal',
    'Mangalsutra',
    'Cufflinks & Tie Pins'
  ],
  'Fashion & Apparel': [
    'Sarees & Lehengas',
    'Kurtis & Ethnic Sets',
    'Dresses & Gowns',
    'T-Shirts & Polos',
    'Formal Shirts & Blouses',
    'Trousers & Chinos',
    'Jeans & Denim',
    'Jackets & Blazers',
    'Activewear & Gym Sets',
    'Loungewear & Sleepwear'
  ],
  'Footwear': [
    'Running & Sports Shoes',
    'Casual Sneakers',
    'Formal Leather Shoes',
    'Loafers & Moccasins',
    'Sandals & Floaters',
    'Heels & Pumps',
    'Flats & Ballerinas',
    'Leather Boots',
    'Slides & Flip-Flops'
  ],
  'Millets & Organic Foods': [
    'Foxtail Millet (Kangni)',
    'Finger Millet (Ragi)',
    'Little Millet (Samai)',
    'Kodo Millet (Kodra)',
    'Barnyard Millet (Sanwa)',
    'Cold-Pressed Oils',
    'Whole Spices & Masalas',
    'Organic Honey & Jaggery',
    'Millet Cookies & Healthy Snacks',
    'Unpolished Grains & Pulses'
  ],
  'Gifts & Crafts': [
    'Personalized Keepsakes',
    'Resin Art Pieces',
    'Handmade Scented Candles',
    'Photo Frames & Custom Albums',
    'Wooden Handicrafts',
    'Curated Luxury Gift Hampers',
    'Handcrafted Leather Accessories',
    'Festive Celebration Sets'
  ],
  'Toys & Games': [
    'Wooden Educational Toys',
    'Montessori & STEM Kits',
    'Puzzles & Brain Teasers',
    'Board Games & Strategy Cards',
    'Plush Soft Toys',
    'Action Figures & Collectibles',
    'Remote Control Vehicles',
    'Dolls & Pretend Play Sets'
  ],
  'Home & Living': [
    'Bedsheets & Quilts',
    'Cushion Covers & Throws',
    'Ceramic Tableware & Crockery',
    'Wall Art & Canvas Frames',
    'Table Lamps & Ambient Lighting',
    'Hand-Woven Rugs & Carpets',
    'Indoor Planters & Ceramic Vases',
    'Aromatherapy Diffusers & Mists'
  ],
  'Beauty & Personal Care': [
    'Face Serums & Glow Oils',
    'Organic Face Cleansers',
    'Lipsticks & Velvet Lip Tints',
    'Hair Shampoos & Organic Oils',
    'Artisanal Perfumes & Attars',
    'Exfoliating Body Scrubs',
    'Cold-Process Handcrafted Soaps'
  ],
  'Electronics & Gadgets': [
    'True Wireless Earbuds (TWS)',
    'Portable Bluetooth Speakers',
    'Smart Watches & Fitness Trackers',
    'Wireless Fast Charging Docks',
    'Phone Protection Cases & Covers',
    'Power Banks & Braided Cables',
    'Over-Ear Studio Headphones'
  ]
};

export const OPTION_PRESETS = [
  'Size',
  'Shoe Size',
  'Ring Size',
  'Color',
  'Metal Type',
  'Weight/Volume',
  'Material',
  'Storage',
  'Pack Size',
  'Custom'
];

export const OPTION_NAME_SUGGESTIONS = {
  Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'],
  'Shoe Size': ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'],
  'Ring Size': ['Size 10', 'Size 12', 'Size 14', 'Size 16', 'Size 18', 'Size 20', 'Size 22'],
  Color: ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Midnight Black', 'Pearl White', 'Navy Blue', 'Emerald Green', 'Ruby Red', 'Champagne'],
  'Metal Type': ['18K Yellow Gold', '22K Solid Gold', '925 Sterling Silver', 'Rose Gold', 'Platinum 950', 'Titanium'],
  'Weight/Volume': ['100g', '250g', '500g', '1 kg', '2 kg', '5 kg', '50 ml', '100 ml', '200 ml', '500 ml'],
  Material: ['100% Mulberry Silk', 'Pure Organic Cotton', 'Natural Linen', 'Genuine Leather', 'Stainless Steel', 'Ceramic', 'Solid Oak Wood'],
  Storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  'Pack Size': ['Pack of 1', 'Pack of 2', 'Pack of 3', 'Pack of 5', 'Gift Box Set']
};

export const AdminAddProduct = () => {
  const { currentStore, products, addProduct, updateProduct, showToast } = useMerchantAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const existingProduct = useMemo(() => {
    if (!editId) return null;
    return products.find((p) => p.id === editId) || null;
  }, [editId, products]);

  // Form State
  const defaultStoreCategory = useMemo(() => {
    if (!currentStore) return UNIVERSAL_CATEGORIES[0];
    const catLabel = (currentStore.categoryLabel || currentStore.vertical || '').toLowerCase();
    const found = UNIVERSAL_CATEGORIES.find(c =>
      c.toLowerCase().includes(catLabel) || catLabel.includes(c.toLowerCase()) ||
      (catLabel.includes('t-shirt') && c.includes('Fashion')) ||
      (catLabel.includes('apparel') && c.includes('Fashion')) ||
      (catLabel.includes('cloth') && c.includes('Fashion')) ||
      (catLabel.includes('jewel') && c.includes('Jewelry')) ||
      (catLabel.includes('book') && c.includes('Books'))
    );
    return found || UNIVERSAL_CATEGORIES[0];
  }, [currentStore]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(defaultStoreCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);
  const [productType, setProductType] = useState('');

  // Auto-sync default category if switching stores
  useEffect(() => {
    if (!existingProduct) {
      setCategory(defaultStoreCategory);
    }
  }, [defaultStoreCategory, existingProduct]);

  // Pricing & Tax State
  const [sellingPriceINR, setSellingPriceINR] = useState('');
  const [comparePriceINR, setComparePriceINR] = useState('');
  const [chargeTax, setChargeTax] = useState(true);
  const [gstRatePercent, setGstRatePercent] = useState('3');

  // Media State
  const [mediaList, setMediaList] = useState([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Variants and Dynamic Options State
  const [hasVariants, setHasVariants] = useState(false);
  const [optionSets, setOptionSets] = useState([
    { id: 'opt_1', name: 'Size', values: ['S', 'M', 'L'], valuesString: 'S, M, L' }
  ]);
  const [variantMatrix, setVariantMatrix] = useState([]);

  // Inventory tracking
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState(15);
  const [targetAudience, setTargetAudience] = useState('All / Unisex');

  // Sales Channels
  const [channels, setChannels] = useState(['web', 'whatsapp', 'instagram']);

  // Populate form if editing existing product
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || '');
      setDescription(existingProduct.description || '');
      setCategory(existingProduct.category || UNIVERSAL_CATEGORIES[0]);
      setProductType(existingProduct.productType || '');
      setSellingPriceINR(existingProduct.sellingPriceINR?.toString() || '');
      setComparePriceINR(existingProduct.comparePriceINR?.toString() || '');
      setChargeTax(existingProduct.chargeTax ?? true);
      setGstRatePercent(existingProduct.gstRatePercent?.toString() || '3');
      setSku(existingProduct.sku || '');
      setStockQuantity(existingProduct.stockQuantity ?? 10);
      setChannels(existingProduct.channels || ['web', 'whatsapp', 'instagram']);

      if (existingProduct.imageUrl) {
        setMediaList([{ id: 'm_1', url: existingProduct.imageUrl, type: 'image' }]);
      }

      const isVar = Boolean(existingProduct.hasVariants);
      setHasVariants(isVar);
      if (existingProduct.optionSets && Array.isArray(existingProduct.optionSets) && existingProduct.optionSets.length > 0) {
        setOptionSets(existingProduct.optionSets.map(os => ({
          ...os,
          valuesString: Array.isArray(os.values) ? os.values.join(', ') : (os.valuesString || '')
        })));
      }
      if (existingProduct.variantMatrix && existingProduct.variantMatrix.length > 0) {
        setVariantMatrix(existingProduct.variantMatrix);
      }
    }
  }, [existingProduct]);

  // Handle Cartesians / Combinations for Option Sets
  useEffect(() => {
    if (!hasVariants || optionSets.length === 0) {
      setVariantMatrix([]);
      return;
    }

    const validSets = optionSets.filter((os) => os.values.length > 0);
    if (validSets.length === 0) {
      setVariantMatrix([]);
      return;
    }

    // Cartesian product helper
    const cartesian = (arrays) => {
      return arrays.reduce(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
        [[]]
      );
    };

    const valueArrays = validSets.map((os) =>
      os.values.map((val) => ({ set: os.name, val }))
    );
    const combinations = cartesian(valueArrays);

    const generated = combinations.map((combo, idx) => {
      const comboTitle = combo.map((c) => `${c.set}: ${c.val}`).join(' / ');
      const autoSku = sku
        ? `${sku}-${combo.map((c) => c.val.replace(/\s+/g, '').toUpperCase().slice(0, 3)).join('-')}`
        : `SKU-${idx + 1}`;

      const existingMatch = variantMatrix.find((v) => v.title === comboTitle);

      return {
        id: `v_${idx}`,
        title: comboTitle,
        sku: existingMatch?.sku || autoSku,
        price: existingMatch?.price || sellingPriceINR || '0',
        stock: existingMatch?.stock ?? 5,
        options: combo
      };
    });

    setVariantMatrix(generated);
  }, [hasVariants, optionSets, sku]);

  // Option Set Handlers
  const handleAddOptionSet = () => {
    if (optionSets.length >= 3) {
      showToast('Maximum 3 option sets allowed per product', 'warning');
      return;
    }
    const nextPreset = OPTION_PRESETS[optionSets.length] || 'Custom';
    setOptionSets([
      ...optionSets,
      {
        id: `opt_${Date.now()}`,
        name: nextPreset,
        values: ['Default'],
        valuesString: 'Default'
      }
    ]);
  };

  const handleRemoveOptionSet = (id) => {
    setOptionSets(optionSets.filter((os) => os.id !== id));
  };

  const handleOptionNameChange = (id, newName) => {
    setOptionSets(
      optionSets.map((os) => (os.id === id ? { ...os, name: newName } : os))
    );
  };

  const handleOptionValuesChange = (id, valuesStr) => {
    const parsed = valuesStr
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    setOptionSets(
      optionSets.map((os) =>
        os.id === id ? { ...os, valuesString: valuesStr, values: parsed } : os
      )
    );
  };

  // Media Handlers
  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;
    setMediaList([
      ...mediaList,
      { id: `m_${Date.now()}`, url: mediaUrlInput.trim(), type: 'image' }
    ]);
    setMediaUrlInput('');
    showToast('Image URL added to media gallery', 'success');
  };

  const handleRemoveMedia = (id) => {
    setMediaList(mediaList.filter((m) => m.id !== id));
  };

  const toggleChannel = (channelId) => {
    if (channels.includes(channelId)) {
      setChannels(channels.filter((c) => c !== channelId));
    } else {
      setChannels([...channels, channelId]);
    }
  };

  const handleVariantMatrixChange = (index, field, value) => {
    const updated = [...variantMatrix];
    updated[index][field] = value;
    setVariantMatrix(updated);
  };

  // Calculate discount preview percent
  const discountPercent = useMemo(() => {
    const sp = Number(sellingPriceINR);
    const cp = Number(comparePriceINR);
    if (cp > sp && sp > 0) {
      return Math.round(((cp - sp) / cp) * 100);
    }
    return 0;
  }, [sellingPriceINR, comparePriceINR]);

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    if (!sellingPriceINR || Number(sellingPriceINR) <= 0) {
      showToast('Please set a valid selling price', 'error');
      return;
    }

    const finalCategory = showCustomCatInput && customCategory.trim()
      ? customCategory.trim()
      : category;

    const primaryImg =
      mediaList[0]?.url ||
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';

    const isVariantsActive = Boolean(hasVariants);
    const validOptionSets = isVariantsActive ? optionSets.filter(os => os.values && os.values.length > 0) : [];

    const sizeOptionSet = validOptionSets.find(os => os.name.toLowerCase().includes('size'));
    const colorOptionSet = validOptionSets.find(os => os.name.toLowerCase().includes('color') || os.name.toLowerCase().includes('finish') || os.name.toLowerCase().includes('shade'));
    const formatOptionSet = validOptionSets.find(os => os.name.toLowerCase().includes('format') || os.name.toLowerCase().includes('edition'));

    const explicitSizes = isVariantsActive && sizeOptionSet?.values?.length > 0 ? sizeOptionSet.values : [];
    const explicitColors = isVariantsActive && colorOptionSet?.values?.length > 0 ? colorOptionSet.values : [];
    const explicitFormats = isVariantsActive && formatOptionSet?.values?.length > 0 ? formatOptionSet.values : [];

    const effectiveStock = isVariantsActive && variantMatrix.length > 0
      ? variantMatrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : Number(stockQuantity || 0);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: finalCategory,
      productType: productType.trim() || finalCategory,
      price: Number(sellingPriceINR),
      sellingPriceINR: Number(sellingPriceINR),
      comparePriceINR: comparePriceINR ? Number(comparePriceINR) : Number(sellingPriceINR),
      brand: currentStore?.name || 'Bespoke D2C',
      chargeTax,
      gstRatePercent: Number(gstRatePercent),
      imageUrl: primaryImg,
      images: mediaList.length > 0 ? mediaList.map((m) => m.url) : [primaryImg],
      mediaList,
      hasVariants: isVariantsActive && validOptionSets.length > 0,
      optionSets: isVariantsActive ? validOptionSets : [],
      availableSizes: explicitSizes,
      availableColors: explicitColors,
      availableFormats: explicitFormats,
      variantMatrix: isVariantsActive ? variantMatrix : [],
      sku: sku.trim() || `GJ-${Date.now().toString().slice(-6)}`,
      stockQuantity: effectiveStock,
      stock: effectiveStock,
      status: effectiveStock > 0 ? 'Available' : 'No',
      targetAudience,
      channels,
      storeSubdomain: (currentStore?.subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, ''),
      tenantId: currentStore?.id,
      updatedAt: new Date().toISOString()
    };

    if (existingProduct) {
      updateProduct(existingProduct.id, payload);
      showToast(`Updated "${payload.name}" in store catalog`, 'success');
    } else {
      addProduct(payload);
      showToast(`Published "${payload.name}" with 0% platform fee!`, 'success');
    }

    navigate('/admin/products');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-[#0F172A]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FBCBCB] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-2xl bg-white border border-[#FBCBCB] hover:bg-[#FEE2E2] text-[#881337] hover:text-[#0F172A] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] font-serif tracking-tight">
              {existingProduct ? 'Edit Product Item' : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#374151]">
              Publishing to <span className="text-[#0F172A] font-semibold">{currentStore.name}</span> ({currentStore.categoryLabel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-bold text-[#881337] transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition transform active:scale-95"
          >
            {existingProduct ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9F1239]" /> 1. Basic Information
            </h2>
            <span className="text-[10px] text-[#881337] uppercase tracking-wider font-semibold">
              General Catalog Data
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A]">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mulberry Silk Kanjeevaram Saree / AeroGlide Sneakers / Organic Foxtail Millet"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C] text-sm font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A]">
                Product Description (Markdown Supported)
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the materials, dimensions, craftsmanship, usage guidelines, and packaging specifications..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C] leading-relaxed font-sans"
              />
            </div>

            {/* Category & Product Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A]">Universal Product Category *</label>
                <select
                  value={showCustomCatInput ? 'Custom' : category}
                  onChange={(e) => {
                    if (e.target.value === 'Custom') {
                      setShowCustomCatInput(true);
                    } else {
                      setShowCustomCatInput(false);
                      setCategory(e.target.value);
                      const subcats = CATEGORY_SUBCATEGORIES_MAP[e.target.value] || [];
                      if (subcats.length > 0) {
                        setProductType(subcats[0]);
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] font-medium"
                >
                  {UNIVERSAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Custom">➕ Add Custom Category</option>
                </select>

                {showCustomCatInput && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name..."
                    className="w-full mt-2 px-3.5 py-2 bg-white border border-[#BE123C] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#0F172A]">Product Type / Sub-Category *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] font-medium"
                >
                  {(CATEGORY_SUBCATEGORIES_MAP[category] || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Custom">➕ Custom Sub-Category</option>
                </select>

                {/* Subcategory quick-picker chips */}
                <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                  {(CATEGORY_SUBCATEGORIES_MAP[category] || []).slice(0, 6).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setProductType(sub)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                        productType === sub
                          ? 'bg-[#9F1239] text-white'
                          : 'bg-[#fedddd] text-[#881337] hover:bg-[#FEE2E2] border border-[#F8B4B4]'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing & Taxes */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" /> 2. Pricing & Taxes (0% Commission SaaS)
            </h2>
            <span className="text-[10px] text-emerald-800 font-bold bg-[#EAF5EC] px-2.5 py-0.5 rounded-full border border-emerald-200">
              100% Payout Retained
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selling Price */}
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Selling Price (Actual S.P) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-emerald-800">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellingPriceINR}
                    onChange={(e) => setSellingPriceINR(e.target.value)}
                    placeholder="84500"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-emerald-800 font-mono font-bold text-sm focus:outline-none focus:border-[#BE123C]"
                  />
                </div>
              </div>

              {/* Compare-at Price */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#0F172A]">Compare-at Price (Strikethrough)</label>
                  {discountPercent > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
                      {discountPercent}% OFF Preview
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={comparePriceINR}
                    onChange={(e) => setComparePriceINR(e.target.value)}
                    placeholder="98000"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#881337] font-mono focus:outline-none focus:border-[#BE123C]"
                  />
                </div>
              </div>
            </div>

            {/* Charge Tax Toggle & GST Rate */}
            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0F172A]">Charge Tax on this Product</p>
                  <p className="text-[10px] text-[#374151]">
                    Automatically itemizes CGST/SGST on checkout and tax invoices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChargeTax(!chargeTax)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                    chargeTax ? 'bg-[#9F1239] justify-end' : 'bg-stone-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {chargeTax && (
                <div className="pt-2 border-t border-[#FBCBCB] flex items-center gap-3 animate-fade-in">
                  <span className="text-[#0F172A] font-semibold">Applicable GST Rate:</span>
                  <div className="flex items-center gap-1.5">
                    {['0%', '3%', '5%', '12%', '18%'].map((rate) => {
                      const num = rate.replace('%', '');
                      return (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGstRatePercent(num)}
                          className={`px-3 py-1 rounded-xl font-mono font-bold text-xs transition ${
                            gstRatePercent === num
                              ? 'bg-[#9F1239] text-white shadow-xs'
                              : 'bg-white border border-[#FBCBCB] text-[#881337] hover:bg-[#FEE2E2]'
                          }`}
                        >
                          {rate}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Universal Media Uploader */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#9F1239]" /> 3. Universal Media Uploader
            </h2>
            <span className="text-[10px] text-[#374151]">Images & Video (Max 15MB/file)</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Native File Upload / Drag & Drop Box */}
            <label className="cursor-pointer p-6 rounded-3xl border-2 border-dashed border-[#FBCBCB] hover:border-[#BE123C] bg-[#fedddd]/60 flex flex-col items-center justify-center text-center space-y-2 transition block">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      if (uploadEvent.target?.result) {
                        setMediaList(prev => [
                          ...prev,
                          { id: `m_${Date.now()}_${Math.random()}`, url: uploadEvent.target.result, type: 'image' }
                        ]);
                        showToast(`Uploaded ${file.name} from your device!`, 'success');
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#0F172A]">
                Click to browse files or drag & drop high-resolution product photos
              </p>
              <p className="text-[10px] text-[#374151]">
                Supports JPG, PNG, WEBP, and GIF files directly from your computer
              </p>
            </label>

            {/* Direct URL Fallback */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="Or paste direct image / video URL (https://images.unsplash.com/...)"
                className="flex-1 px-3.5 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C] font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-4 py-2 rounded-2xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] font-bold transition whitespace-nowrap"
              >
                + Add URL
              </button>
            </div>

            {/* Thumbnail Preview Grid */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {mediaList.map((media, idx) => (
                  <div
                    key={media.id}
                    className="relative group rounded-2xl overflow-hidden border border-[#FBCBCB] bg-white aspect-square"
                  >
                    <img
                      src={media.url}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#9F1239] text-white font-bold text-[9px] uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(media.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-xl bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Dynamic Variants & Option Matrix */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9F1239]" /> 4. Dynamic Variants & Category Sets
              </h2>
              <p className="text-[10px] text-[#374151]">
                Configure multiple option combinations (e.g. Size, Color, Metal, Weight)
              </p>
            </div>

            {/* Multiple Options Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#0F172A] font-semibold">Has Multiple Options:</span>
              <button
                type="button"
                onClick={() => setHasVariants(!hasVariants)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  hasVariants ? 'bg-[#9F1239] justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {hasVariants && (
            <div className="space-y-6 text-xs animate-fade-in">
              {/* Option Sets Builder */}
              <div className="space-y-3">
                {optionSets.map((os, idx) => (
                  <div
                    key={os.id}
                    className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">Option Set #{idx + 1}</span>
                      {optionSets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionSet(os.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Preset / Custom Name */}
                      <div>
                        <label className="text-[11px] text-[#374151] block mb-1 font-semibold">Option Name</label>
                        <select
                          value={OPTION_PRESETS.includes(os.name) ? os.name : 'Custom'}
                          onChange={(e) => handleOptionNameChange(os.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                        >
                          {OPTION_PRESETS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Values Comma Separated */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-[#374151] block mb-1 font-semibold">
                          Option Values (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={os.valuesString}
                          onChange={(e) => handleOptionValuesChange(os.id, e.target.value)}
                          placeholder="e.g. S, M, L, XL or 250g, 500g, 1kg or Gold, Silver"
                          className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                        />
                      </div>
                    </div>

                    {/* Quick Suggestion Chips based on Option Name */}
                    {OPTION_NAME_SUGGESTIONS[os.name] && (
                      <div className="pt-1.5 space-y-1">
                        <span className="text-[10px] font-semibold text-[#881337] block">
                          ⚡ Suggested {os.name} Values (Click to Add / Toggle):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {OPTION_NAME_SUGGESTIONS[os.name].map((suggestedVal) => {
                            const isIncluded = os.values.some(
                              (v) => v.toLowerCase().trim() === suggestedVal.toLowerCase().trim()
                            );
                            return (
                              <button
                                key={suggestedVal}
                                type="button"
                                onClick={() => {
                                  let newValues;
                                  if (isIncluded) {
                                    newValues = os.values.filter(
                                      (v) => v.toLowerCase().trim() !== suggestedVal.toLowerCase().trim()
                                    );
                                  } else {
                                    newValues = [...os.values, suggestedVal];
                                  }
                                  const newString = newValues.join(', ');
                                  handleOptionValuesChange(os.id, newString);
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 ${
                                  isIncluded
                                    ? 'bg-[#9F1239] text-white shadow-xs'
                                    : 'bg-[#fedddd] text-[#881337] hover:bg-[#FEE2E2] border border-[#F8B4B4]'
                                }`}
                              >
                                {isIncluded ? '✓' : '+'} {suggestedVal}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Value Pills Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {os.values.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-2.5 py-0.5 rounded-full bg-white border border-[#BE123C] text-[#9F1239] text-[10px] font-bold shadow-xs flex items-center gap-1"
                        >
                          <span>{v}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newValues = os.values.filter((_, idx2) => idx2 !== vIdx);
                              handleOptionValuesChange(os.id, newValues.join(', '));
                            }}
                            className="text-slate-400 hover:text-rose-600 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {optionSets.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddOptionSet}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] font-bold transition text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Option Set (Max 3)
                  </button>
                )}
              </div>

              {/* Generated Variant Matrix Table */}
              {variantMatrix.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] font-serif">
                      Generated Variant Matrix ({variantMatrix.length} Combinations)
                    </span>
                    <span className="text-[10px] text-[#374151]">
                      Total inventory stock will auto-sync from variant quantities
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-[#FBCBCB] bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#FBCBCB] bg-[#FFE4E6]/60 text-[#881337] uppercase text-[10px] font-bold">
                          <th className="py-3 px-3">Variant</th>
                          <th className="py-3 px-3">SKU</th>
                          <th className="py-3 px-3 text-right">Price (₹)</th>
                          <th className="py-3 px-3 text-center">Stock Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FBCBCB]/60 text-[#0F172A]">
                        {variantMatrix.map((vRow, vIdx) => (
                          <tr key={vRow.id} className="hover:bg-[#FEE2E2]/40 transition">
                            <td className="py-2.5 px-3 font-bold text-[#0F172A]">
                              {vRow.title}
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={vRow.sku}
                                onChange={(e) => handleVariantMatrixChange(vIdx, 'sku', e.target.value)}
                                className="px-2.5 py-1 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-mono text-[11px] focus:outline-none focus:border-[#BE123C] w-44"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={vRow.price}
                                onChange={(e) => handleVariantMatrixChange(vIdx, 'price', e.target.value)}
                                className="px-2.5 py-1 bg-white border border-[#FBCBCB] rounded-xl text-emerald-800 font-mono font-bold text-[11px] text-right focus:outline-none focus:border-[#BE123C] w-28"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                value={vRow.stock}
                                onChange={(e) => handleVariantMatrixChange(vIdx, 'stock', Number(e.target.value))}
                                className="px-2.5 py-1 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-mono font-bold text-[11px] text-center focus:outline-none focus:border-[#BE123C] w-20"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: Inventory Tracking & Target Audience */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9F1239]" /> 5. Inventory Tracking & Audience
            </h2>
            <span className="text-[10px] text-[#374151] uppercase font-semibold">SKU & Stock Management</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Master SKU */}
            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A]">Master SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. GJ-SAR-01"
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#BE123C]"
              />
            </div>

            {/* Single Stock Quantity */}
            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A]">
                {hasVariants ? 'Total Combined Stock' : 'Stock Quantity Count *'}
              </label>
              <input
                type="number"
                min="0"
                disabled={hasVariants}
                value={
                  hasVariants && variantMatrix.length > 0
                    ? variantMatrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
                    : stockQuantity
                }
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#BE123C] disabled:opacity-60"
              />
              <span className="text-[10px] text-[#374151] block">
                {hasVariants ? 'Derived from variant matrix sum' : '0 units auto-marks as Out of Stock'}
              </span>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="font-semibold text-[#0F172A]">Target Audience / Demography</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
              >
                <option value="All / Unisex">All / Unisex</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: Publishing Channels */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <h2 className="text-sm font-bold text-[#0F172A] font-serif flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#9F1239]" /> 6. Publishing Sales Channels
            </h2>
            <span className="text-[10px] text-[#374151]">Select where this SKU is listed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { id: 'web', label: 'Online Storefront', icon: Globe },
              { id: 'whatsapp', label: 'WhatsApp Catalog', icon: MessageSquare },
              { id: 'instagram', label: 'Instagram / FB Shop', icon: Instagram }
            ].map((ch) => {
              const isSelected = channels.includes(ch.id);
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-2 transition ${
                    isSelected
                      ? 'bg-[#fedddd] border-[#F8B4B4] text-[#881337] font-bold shadow-xs'
                      : 'bg-white border-[#FBCBCB] text-[#374151] hover:bg-[#fedddd]'
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#9F1239]" />
                  <span className="text-xs">{ch.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] flex items-center justify-between shadow-xs">
          <Link
            to="/admin/products"
            className="text-xs font-semibold text-[#374151] hover:text-[#0F172A]"
          >
            ← Back to Products Directory
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2 rounded-2xl bg-white border border-[#FBCBCB] text-xs font-bold text-[#881337] hover:bg-[#FEE2E2] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition transform active:scale-95"
            >
              {existingProduct ? 'Save Product Changes' : 'Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
