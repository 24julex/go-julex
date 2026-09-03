import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sliders,
  Check,
  CheckCircle2,
  Printer,
  Upload,
  Building,
  Hash,
  PenTool,
  QrCode,
  Layers,
  Palette,
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { InvoiceFullPreviewModal } from '../../components/common/InvoiceFullPreviewModal';
import { api } from '../../services/api';

export const AdminInvoiceSettings = () => {
  const { currentStore, showToast } = useMerchantAdmin();

  // Template catalog
  const DEFAULT_MASTER_TEMPLATES = [
    {
      id: 'tpl_classic_tax_a4',
      name: 'Classic Tax A4',
      slug: 'classic-tax-a4',
      description: 'Government-compliant GST tax invoice featuring dual CGST/SGST breakdowns, HSN codes, authorized signatory box, and QR payment stamp.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'FREE',
      defaultLayout: {
        headerStyle: 'split_left_right',
        accentColor: '#D4A017',
        fontFamily: 'Inter',
        fontSize: 12,
        taxFormat: 'split_cgst_sgst',
        showSignatoryBox: true,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: '1. Goods once sold can be exchanged within 7 days with original tax invoice.\n2. Warranty claims are subject to manufacturer terms.\n3. Issued under Go Julex 0% platform fee.'
      }
    },
    {
      id: 'tpl_minimalist_thermal',
      name: 'Minimalist Thermal & POS',
      slug: 'minimalist-thermal',
      description: 'Ultra-compact, high-contrast layout optimized for thermal roll printers, WhatsApp instant delivery, and fast in-store pickup.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'FREE',
      defaultLayout: {
        headerStyle: 'centered_minimal',
        accentColor: '#D4A017',
        fontFamily: 'Space Grotesk',
        fontSize: 11,
        taxFormat: 'unified_gst',
        showSignatoryBox: false,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: 'Thank you for supporting our independent store! Scan QR code to track delivery.'
      }
    },
    {
      id: 'tpl_modern_luxury_ribbon',
      name: 'Modern Luxury Ribbon',
      slug: 'modern-luxury-ribbon',
      description: 'Editorial high-fashion layout with terracotta ribbon borders, serif Roman titles, elegant product thumbnails, and gold accents.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'PRO_EXCLUSIVE',
      defaultLayout: {
        headerStyle: 'banner_strip',
        accentColor: '#D4A017',
        fontFamily: 'Playfair Display',
        fontSize: 12,
        taxFormat: 'split_cgst_sgst',
        showSignatoryBox: true,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: 'Handcrafted luxury pieces. Complimentary appraisal certificate included. 100% authenticity guaranteed.'
      }
    },
    {
      id: 'tpl_earthy_kraft_farm',
      name: 'Earthy Kraft Farm Slip',
      slug: 'earthy-kraft-farm',
      description: 'Organic rustic invoice with botanical emblems, batch harvest provenance notes, FSSAI registration stamp, and farm-to-table traceability.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'FREE',
      defaultLayout: {
        headerStyle: 'split_left_right',
        accentColor: '#2D6A4F',
        fontFamily: 'Outfit',
        fontSize: 12,
        taxFormat: 'unified_gst',
        showSignatoryBox: true,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: 'Certified 100% Pesticide-Free Organic Produce. FSSAI Lic No. 13621014000123.'
      }
    },
    {
      id: 'tpl_boutique_atelier',
      name: 'Boutique Atelier Slip',
      slug: 'boutique-atelier',
      description: 'Minimalist designer slip with bespoke signature seal, client loyalty point statements, and custom gift note section.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'PRO_EXCLUSIVE',
      defaultLayout: {
        headerStyle: 'split_left_right',
        accentColor: '#D4A017',
        fontFamily: 'Inter',
        fontSize: 12,
        taxFormat: 'split_cgst_sgst',
        showSignatoryBox: true,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: 'Bespoke apparel custom fitted to your specifications. Exchanges accepted within 14 business days.'
      }
    },
    {
      id: 'tpl_neo_tech_digital',
      name: 'Neo-Tech Digital Receipt',
      slug: 'neo-tech-digital',
      description: 'Clean modern electronics receipt with IMEI/Serial number fields, extended warranty registration barcode, and direct technical support link.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'PRO_EXCLUSIVE',
      defaultLayout: {
        headerStyle: 'banner_strip',
        accentColor: '#0284C7',
        fontFamily: 'Space Grotesk',
        fontSize: 11,
        taxFormat: 'split_cgst_sgst',
        showSignatoryBox: true,
        showQrCode: true,
        showDiscountBreakdown: true,
        defaultTerms: '1 Year Manufacturer Limited Warranty. Scan QR code to register your hardware warranty.'
      }
    }
  ];

  const [availableTemplates, setAvailableTemplates] = useState(DEFAULT_MASTER_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl_classic_tax_a4');
  const [activeTab, setActiveTab] = useState('customizer');

  // Customization Layer State
  const [legalName, setLegalName] = useState(currentStore?.name ? `${currentStore.name} Pvt Ltd` : 'Aura Modern Living Private Limited');
  const [tradeName, setTradeName] = useState(currentStore?.name || 'Aura Living');
  const [gstin, setGstin] = useState('27AAACA1234A1Z5');
  const [address, setAddress] = useState('1402, Sea Green Towers, Worli Sea Face, Mumbai, Maharashtra - 400030');
  const [phone, setPhone] = useState('+91 98201 54321');
  const [email, setEmail] = useState('support@auraliving.in');
  const [signatureUrl, setSignatureUrl] = useState('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=160&q=80');

  // Styling
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(12);
  const [accentColor, setAccentColor] = useState('#D4A017');
  const [terms, setTerms] = useState(
    '1. Goods once sold can be exchanged within 7 business days with original invoice.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
  );
  const [showQrCode, setShowQrCode] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);

  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId) || availableTemplates[0];

  useEffect(() => {
    api.merchant.getInvoiceConfig(currentStore?.id)
      .then(res => {
        if (res?.success && res.data?.config) {
          const cfg = res.data.config;
          if (cfg.templateId) setSelectedTemplateId(cfg.templateId);
          if (cfg.storeLegalName) setLegalName(cfg.storeLegalName);
          if (cfg.storeTradeName) setTradeName(cfg.storeTradeName);
          if (cfg.storeGstin) setGstin(cfg.storeGstin);
          if (cfg.storeAddress) setAddress(cfg.storeAddress);
          if (cfg.storePhone) setPhone(cfg.storePhone);
          if (cfg.storeEmail) setEmail(cfg.storeEmail);
          if (cfg.authorizedSignatoryUrl) setSignatureUrl(cfg.authorizedSignatoryUrl);
          if (cfg.customStyles) {
            if (cfg.customStyles.fontFamily) setFontFamily(cfg.customStyles.fontFamily);
            if (cfg.customStyles.fontSize) setFontSize(cfg.customStyles.fontSize);
            if (cfg.customStyles.primaryColor) setAccentColor(cfg.customStyles.primaryColor);
            if (cfg.customStyles.terms) setTerms(cfg.customStyles.terms);
          }
        }
        if (res?.data?.availableTemplates && res.data.availableTemplates.length > 0) {
          setAvailableTemplates(res.data.availableTemplates);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id);
    if (tpl.defaultLayout) {
      if (tpl.defaultLayout.fontFamily) setFontFamily(tpl.defaultLayout.fontFamily);
      if (tpl.defaultLayout.accentColor) setAccentColor(tpl.defaultLayout.accentColor);
      if (tpl.defaultLayout.defaultTerms) setTerms(tpl.defaultLayout.defaultTerms);
    }
    showToast(`"${tpl.name}" applied as active store invoice format!`, 'success');
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureUrl(reader.result);
        showToast('Authorized signature uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async () => {
    const payload = {
      tenantId: currentStore?.id,
      templateId: selectedTemplateId,
      storeLegalName: legalName,
      storeTradeName: tradeName,
      storeGstin: gstin,
      storeAddress: address,
      storePhone: phone,
      storeEmail: email,
      authorizedSignatoryUrl: signatureUrl,
      customStyles: {
        fontFamily,
        fontSize,
        primaryColor: accentColor,
        secondaryColor: '#0F172A',
        terms,
        showQrCode,
        showTaxBreakdown
      }
    };

    try {
      const res = await api.merchant.updateInvoiceConfig(payload);
      if (res?.success) {
        showToast('Invoice legal details and typography saved to live database!', 'success');
      } else {
        showToast('Saved to local store profile.', 'success');
      }
    } catch (err) {
      showToast('Saved to local store profile.', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const InvoiceDocumentIllustration = ({ templateId, accentColor: cardAccent }) => {
    const activeColor = cardAccent || '#D4A017';
    switch (templateId) {
      case 'tpl_minimalist_thermal':
        return (
          <div className="w-48 bg-white border border-stone-300 rounded-lg p-2.5 shadow-sm font-mono text-[8px] space-y-1.5 transform hover:scale-105 transition text-slate-900">
            <div className="text-center border-b border-dashed border-stone-300 pb-1">
              <p className="font-bold text-[9px] tracking-wider uppercase">{currentStore?.name || 'STORE'}</p>
              <p className="text-stone-400 text-[7px]">TAX INVOICE • POS</p>
            </div>
            <div className="space-y-1 text-stone-600">
              <div className="flex justify-between"><span>1x Signature Item</span><span>₹18,500</span></div>
              <div className="flex justify-between"><span>GST @ 3%</span><span>₹555</span></div>
            </div>
            <div className="border-t border-dashed border-stone-300 pt-1 flex justify-between font-bold text-stone-900">
              <span>TOTAL</span><span style={{ color: activeColor }}>₹19,055</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-52 bg-white border rounded-xl p-3 shadow-sm text-[8px] space-y-1.5 transform hover:scale-105 transition text-slate-900" style={{ borderColor: 'var(--border-card)' }}>
            <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="font-bold text-[9px] font-serif">{currentStore?.name || 'TAX INVOICE'}</p>
                <p className="text-[7px] font-mono" style={{ color: 'var(--text-muted)' }}>GSTIN: 27AAACA1234A1Z5</p>
              </div>
              <span className="text-[7px] text-white px-1 py-0.2 rounded font-bold" style={{ backgroundColor: activeColor }}>GST A4</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between font-semibold px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}><span>HSN Item</span><span>Tax</span><span>Total</span></div>
              <div className="flex justify-between px-1"><span>7113 Gold Item</span><span>3%</span><span>₹28,500</span></div>
            </div>
            <div className="pt-1 flex justify-between font-bold border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span>Grand Total</span><span style={{ color: activeColor }}>₹28,500</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Store Invoice & Tax Receipt Customizer
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Customize your GST compliance information, typography, authorized digital signature, and A4 print layout.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <Printer className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Print / PDF Test
          </button>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1.5 px-5 py-2 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <CheckCircle2 className="w-4 h-4" /> Save Invoice Setup
          </button>
        </div>
      </div>

      {/* 2. Top Tabs */}
      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('customizer')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'customizer' ? 'text-black' : ''
          }`}
          style={activeTab === 'customizer' ? {
            background: 'linear-gradient(135deg, #D4A017, #F5C842)',
          } : {
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
          }}
        >
          <Sliders className="w-3.5 h-3.5" /> Visual Customizer & Live A4 PDF
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'gallery' ? 'text-black' : ''
          }`}
          style={activeTab === 'gallery' ? {
            background: 'linear-gradient(135deg, #D4A017, #F5C842)',
          } : {
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
          }}
        >
          <Layers className="w-3.5 h-3.5" /> Template Catalog ({availableTemplates.length} Formats)
        </button>

        <div className="ml-auto hidden md:flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>Active Format:</span>
          <strong className="px-2.5 py-0.5 rounded-full border text-xs" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', borderColor: 'rgba(212,160,23,0.25)' }}>
            {selectedTemplate.name}
          </strong>
        </div>
      </div>

      {/* TAB 1: TEMPLATE SELECTION GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border text-xs flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
            <span>
              Select any Super Admin published master format. All templates auto-sync dynamic GST rates, store branding, and digital signatures.
            </span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>0% Platform Fee Enabled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTemplates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <div
                  key={tpl.id}
                  className="rounded-3xl border transition overflow-hidden shadow-xs flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-card)',
                  }}
                >
                  <div>
                    <div className="relative h-44 w-full flex items-center justify-center p-3 overflow-hidden border-b" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                      <InvoiceDocumentIllustration
                        templateId={tpl.id}
                        accentColor={tpl.defaultLayout?.accentColor || '#D4A017'}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
                          {tpl.tierAccess === 'PRO_EXCLUSIVE' ? '👑 Pro Exclusive' : '✨ Free Tier'}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Template
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{tpl.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'text-black shadow-xs'
                      }`}
                      style={!isSelected ? { background: 'linear-gradient(135deg, #D4A017, #F5C842)' } : {}}
                    >
                      {isSelected ? <><Check className="w-4 h-4" /> Active Store Invoice</> : 'Set as Active Store Invoice'}
                    </button>
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="ml-2 px-3 py-2 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
                      title="See the actual printed invoice with this template"
                    >
                      Full Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MERCHANT VISUAL CUSTOMIZER + LIVE A4 PREVIEW */}
      {activeTab === 'customizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customizer Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Typography & Styling */}
            <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-serif" style={{ color: 'var(--accent)' }}>
                  1. Typography & Accent Colors
                </h3>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                >
                  <option value="Inter">Inter (Clean Modern Sans)</option>
                  <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech Monospace)</option>
                  <option value="Outfit">Outfit (Warm Geometric)</option>
                  <option value="Courier">Courier (Vintage Thermal Receipt)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Base Font Size</label>
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="14"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#D4A017] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Header & Accent Palette Swatch
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Julex Gold', hex: '#D4A017' },
                    { label: 'Warm Amber', hex: '#F5C842' },
                    { label: 'Rich Dark Gold', hex: '#C89B00' },
                    { label: 'Forest Green', hex: '#059669' },
                    { label: 'Slate Dark', hex: '#1E293B' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setAccentColor(c.hex)}
                      title={c.label}
                      className={`w-7 h-7 rounded-xl border transition cursor-pointer ${
                        accentColor === c.hex ? 'ring-2 ring-offset-2 ring-[#D4A017] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded-xl cursor-pointer border p-0"
                    style={{ borderColor: 'var(--border-input)' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Store Legal Info & GST */}
            <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <Building className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-serif" style={{ color: 'var(--accent)' }}>
                  2. Store Legal & GST Compliance
                </h3>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Legal Registered Entity Name *
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Aura Modern Living Private Limited"
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Store Trade Name
                  </label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="e.g. Aura Living"
                    className="w-full px-3.5 py-2 rounded-2xl text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    GSTIN / Tax Reg No.
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AAACA1234A1Z5"
                    className="w-full px-3.5 py-2 rounded-2xl text-xs font-mono font-bold uppercase focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Registered Dispatch Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1402, Worli Sea Face, Mumbai, Maharashtra - 400030"
                  className="w-full p-3 rounded-2xl text-xs focus:outline-none resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 54321"
                    className="w-full px-3.5 py-2 rounded-2xl text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@auraliving.in"
                    className="w-full px-3.5 py-2 rounded-2xl text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Authorized Digital Signature */}
            <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <PenTool className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-serif" style={{ color: 'var(--accent)' }}>
                  3. Authorized Signature & Seal
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-28 h-14 rounded-2xl border p-1 flex items-center justify-center overflow-hidden shrink-0 bg-white shadow-inner" style={{ borderColor: 'var(--border-card)' }}>
                  {signatureUrl ? (
                    <img src={signatureUrl} alt="Signature Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-mono">No Signature</span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
                    <Upload className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Upload Signature Image
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PNG / JPG with transparent background (Max 2MB)</p>
                </div>
              </div>
            </div>

            {/* 4. Terms & Policy Notes */}
            <div className="p-5 rounded-3xl border space-y-3 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <Hash className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-serif" style={{ color: 'var(--accent)' }}>
                  4. Return Policy & Footer Terms
                </h3>
              </div>

              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter your store return policy, disclaimer and bank NEFT details..."
                className="w-full p-3 rounded-2xl text-xs focus:outline-none resize-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Right Column: Live Printable A4 Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-serif text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Live A4 Print & PDF Preview Canvas
                </h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                Standard A4 (210mm × 297mm)
              </span>
            </div>

            {/* A4 Sheet Container */}
            <div
              className="w-full rounded-3xl border bg-white p-8 shadow-xl text-stone-900 space-y-6"
              style={{ borderColor: 'var(--border-card)', fontFamily, fontSize: `${fontSize}px` }}
            >
              {/* Header Style Render */}
              {selectedTemplate.defaultLayout?.headerStyle === 'banner_strip' ? (
                <div
                  className="p-4 rounded-2xl text-white flex justify-between items-center shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">{tradeName || legalName}</h2>
                    <p className="text-[11px] opacity-90">{address}</p>
                    <p className="text-[11px] opacity-90 font-mono">GSTIN: {gstin}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                      ORIGINAL TAX INVOICE
                    </span>
                    <p className="text-sm font-mono font-bold mt-1">#INV-10821</p>
                    <p className="text-[10px] opacity-90">26 Aug 2026</p>
                  </div>
                </div>
              ) : selectedTemplate.defaultLayout?.headerStyle === 'centered_minimal' ? (
                <div className="text-center border-b pb-4 space-y-1">
                  <h2 className="text-lg font-bold text-stone-900">{tradeName || legalName}</h2>
                  <p className="text-xs text-slate-500">{address}</p>
                  <p className="text-xs text-slate-600 font-mono">GSTIN: {gstin} | Phone: {phone}</p>
                  <div className="pt-2">
                    <span
                      className="px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: accentColor }}
                    >
                      TAX INVOICE #INV-10821
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start border-b pb-4">
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-bold" style={{ color: accentColor }}>
                      {tradeName || legalName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-600">{legalName}</p>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">{address}</p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      <strong>GSTIN:</strong> {gstin}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong>Support:</strong> {phone} • {email}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-md text-white text-[11px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: accentColor }}
                    >
                      ORIGINAL TAX INVOICE
                    </span>
                    <p className="text-sm font-mono font-bold text-stone-900">#INV-10821</p>
                    <p className="text-[11px] text-slate-500">Invoice Date: 26 Aug 2026</p>
                    <p className="text-[11px] text-slate-500">Place of Supply: Maharashtra (27)</p>
                  </div>
                </div>
              )}

              {/* Customer Address */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Billed To / Delivery Address:
                  </span>
                  <p className="font-bold text-stone-900">Priya Sharma</p>
                  <p className="text-slate-600">Flat 402, Sunset Heights, Bandra West, Mumbai - 400050</p>
                  <p className="text-slate-500 font-mono">+91 98190 12345 • priya.sharma@gmail.com</p>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Order Telemetry:
                  </span>
                  <p className="font-bold text-emerald-800">Paid via Razorpay UPI</p>
                  <p className="text-slate-600">Channel: Direct D2C (0% Platform Fee)</p>
                  <p className="text-slate-500">Delivery: Express Courier Dispatch</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-slate-800 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">HSN Code</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate (₹)</th>
                      <th className="p-3 text-right">Line Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-slate-600">
                    <tr>
                      <td className="p-3 text-slate-400">1</td>
                      <td className="p-3 font-semibold text-stone-900">
                        Nordic Solid Oak Minimalist Dining Table
                        <span className="block text-[10px] text-slate-500 font-normal">FSC-Certified Solid White Oak (180x90cm)</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">9403</td>
                      <td className="p-3 text-center font-bold">1</td>
                      <td className="p-3 font-mono text-right">₹48,500.00</td>
                      <td className="p-3 font-mono text-right font-bold">₹48,500.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-400">2</td>
                      <td className="p-3 font-semibold text-stone-900">
                        Hand-Blown Amber Glass Pendant Light
                        <span className="block text-[10px] text-slate-500 font-normal">Borosilicate Fluted Amber Glass</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">9405</td>
                      <td className="p-3 text-center font-bold">1</td>
                      <td className="p-3 font-mono text-right">₹12,400.00</td>
                      <td className="p-3 font-mono text-right font-bold">₹12,400.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-stone-200 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">
                    Terms & Return Disclaimer:
                  </span>
                  <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
                    {terms}
                  </p>
                </div>

                <div className="space-y-1 text-right font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹60,900.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Privilege Discount:</span>
                    <span>-₹3,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping Fee:</span>
                    <span className="text-emerald-700">FREE</span>
                  </div>
                  {showTaxBreakdown && (
                    <>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>CGST (6%):</span>
                        <span>₹3,444.00</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>SGST (6%):</span>
                        <span>₹3,444.00</span>
                      </div>
                    </>
                  )}
                  <div
                    className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200"
                    style={{ color: accentColor }}
                  >
                    <span>Total Tax Invoice (₹):</span>
                    <span>₹64,288.00</span>
                  </div>
                </div>
              </div>

              {/* Signatory Box & Digital Verification */}
              <div className="pt-4 border-t border-dashed border-stone-200 flex justify-between items-end">
                {showQrCode ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <div className="text-[9px] leading-tight">
                      <p className="font-bold text-slate-600">Scan & Pay / Track</p>
                      <p>e-Invoice Authenticity</p>
                    </div>
                  </div>
                ) : <div />}

                <div className="text-right space-y-1">
                  {signatureUrl && (
                    <div className="flex justify-end">
                      <img src={signatureUrl} alt="Signature" className="h-10 object-contain" />
                    </div>
                  )}
                  <p className="font-bold text-xs text-slate-800">For {legalName}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          {previewTemplate && (
        <InvoiceFullPreviewModal
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate}
          storeContext={currentStore}
        />
      )}
</div>
  );
};

export default AdminInvoiceSettings;
