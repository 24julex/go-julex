import React, { useState } from 'react';
import { InvoiceFullPreviewModal } from '../../components/common/InvoiceFullPreviewModal';
import {
  FileText,
  Plus,
  Sliders,
  CheckCircle2,
  Eye,
  Trash2,
  Edit3,
  X,
  Printer,
  QrCode,
  Store,
  Layers,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

/* Rendered Mini Live Invoice Document Card Component */
const MiniInvoiceDocumentCard = ({ template }) => {
  const layout = template.defaultLayout || {};
  const accent = layout.accentColor || '#D4A017';
  const headerStyle = layout.headerStyle || 'split_left_right';
  const fontFamily = layout.fontFamily || 'Inter';

  return (
    <div
      className="w-full h-full p-3 bg-white text-slate-900 flex flex-col justify-between select-none overflow-hidden relative shadow-inner"
      style={{ fontFamily }}
    >
      {/* Invoice Header Variant */}
      {headerStyle === 'banner_strip' ? (
        <div className="p-2 rounded-lg text-white flex justify-between items-center shadow-xs" style={{ backgroundColor: accent }}>
          <div>
            <h4 className="font-extrabold text-[10px] leading-tight">GO JULEX STORE</h4>
            <p className="text-[7px] opacity-90">GSTIN: 27AAACA1234A1Z5</p>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase block">TAX INVOICE</span>
            <p className="text-[7px] font-mono">#INV-88210</p>
          </div>
        </div>
      ) : headerStyle === 'centered_logo' ? (
        <div className="text-center pb-1.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <span className="text-[10px] font-extrabold block" style={{ color: accent }}>ORIGINAL TAX INVOICE</span>
          <h4 className="font-black text-xs">GO JULEX STORE</h4>
          <p className="text-[7px] text-slate-500 font-mono">#INV-88210 • 26-Aug-2026</p>
        </div>
      ) : (
        <div className="flex justify-between items-start pb-1.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <div>
            <h4 className="font-black text-xs">GO JULEX STORE</h4>
            <p className="text-[7px] text-slate-500">GSTIN: 27AAACA1234A1Z5</p>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase block" style={{ color: accent }}>TAX INVOICE</span>
            <p className="text-[8px] font-mono font-bold">#INV-88210</p>
          </div>
        </div>
      )}

      {/* Mini Customer & Billing Strip */}
      <div className="py-1 flex justify-between text-[7px] text-slate-600 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div>Billed to: <strong className="text-slate-900">Ananya Verma</strong></div>
        <div>Date: <strong>26 Aug 2026</strong></div>
      </div>

      {/* Mini 2-Row Line Item Table */}
      <div className="py-1 space-y-0.5 text-[7px]">
        <div className="flex justify-between font-bold text-slate-500 border-b pb-0.5" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <span>Item Description</span>
          <span>Qty</span>
          <span>Amount</span>
        </div>
        <div className="flex justify-between text-slate-800">
          <span className="truncate max-w-[110px]">22K Kundan Choker</span>
          <span>1</span>
          <span className="font-mono">₹42,000</span>
        </div>
        <div className="flex justify-between text-slate-800">
          <span className="truncate max-w-[110px]">925 Silver Anklet</span>
          <span>2</span>
          <span className="font-mono">₹4,000</span>
        </div>
      </div>

      {/* Mini Invoice Summary & QR Stamp */}
      <div className="pt-1.5 border-t flex justify-between items-center text-[7px]" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-1 text-emerald-700 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>GST 18% Paid</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Grand Total: </span>
          <strong className="text-[9px] font-mono font-extrabold" style={{ color: accent }}>₹54,280</strong>
        </div>
      </div>
    </div>
  );
};

export const InvoiceTemplatesPage = () => {
  const {
    masterInvoiceTemplates,
    addMasterInvoiceTemplate,
    updateMasterInvoiceTemplate,
    deleteMasterInvoiceTemplate,
    toggleTemplatePublish,
    showToast
  } = useSuperAdmin();

  const [activeFilter, setActiveFilter] = useState('All');
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    tierAccess: 'FREE',
    isPublished: true,
    defaultLayout: {
      headerStyle: 'split_left_right',
      accentColor: '#D4A017',
      fontFamily: 'Inter',
      fontSize: 12,
      columns: [
        { id: 'sno', label: 'S.No', visible: true, width: '8%' },
        { id: 'item', label: 'Item Details', visible: true, width: '42%' },
        { id: 'hsn', label: 'HSN/SAC', visible: true, width: '12%' },
        { id: 'qty', label: 'Qty', visible: true, width: '8%' },
        { id: 'rate', label: 'Rate (₹)', visible: true, width: '15%' },
        { id: 'total', label: 'Total (₹)', visible: true, width: '15%' }
      ],
      showSignatoryBox: true,
      showQrCode: true,
      notesFooter: 'Thank you for supporting 0% fee independent D2C creators!'
    }
  });

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      tierAccess: 'FREE',
      isPublished: true,
      defaultLayout: {
        headerStyle: 'split_left_right',
        accentColor: '#D4A017',
        fontFamily: 'Inter',
        fontSize: 12,
        columns: [
          { id: 'sno', label: 'S.No', visible: true, width: '8%' },
          { id: 'item', label: 'Item Details', visible: true, width: '42%' },
          { id: 'hsn', label: 'HSN/SAC', visible: true, width: '12%' },
          { id: 'qty', label: 'Qty', visible: true, width: '8%' },
          { id: 'rate', label: 'Rate (₹)', visible: true, width: '15%' },
          { id: 'total', label: 'Total (₹)', visible: true, width: '15%' }
        ],
        showSignatoryBox: true,
        showQrCode: true,
        notesFooter: 'Thank you for supporting 0% fee independent D2C creators!'
      }
    });
    setIsBuilderModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplateId(template.id);
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description,
      thumbnailUrl: template.thumbnailUrl || '',
      tierAccess: template.tierAccess || 'FREE',
      isPublished: template.isPublished ?? true,
      defaultLayout: template.defaultLayout || {
        headerStyle: 'split_left_right',
        accentColor: '#D4A017',
        fontFamily: 'Inter',
        fontSize: 12,
        columns: [
          { id: 'sno', label: 'S.No', visible: true, width: '8%' },
          { id: 'item', label: 'Item Details', visible: true, width: '42%' },
          { id: 'hsn', label: 'HSN/SAC', visible: true, width: '12%' },
          { id: 'qty', label: 'Qty', visible: true, width: '8%' },
          { id: 'rate', label: 'Rate (₹)', visible: true, width: '15%' },
          { id: 'total', label: 'Total (₹)', visible: true, width: '15%' }
        ],
        showSignatoryBox: true,
        showQrCode: true,
        notesFooter: 'Thank you for supporting 0% fee independent D2C creators!'
      }
    });
    setIsBuilderModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplateId) {
      updateMasterInvoiceTemplate(editingTemplateId, formData);
      showToast('Master Invoice Template updated across platform!', 'success');
    } else {
      addMasterInvoiceTemplate(formData);
      showToast('New Master Invoice Template created & deployed to all merchants!', 'success');
    }
    setIsBuilderModalOpen(false);
  };

  const toggleColumnVisibility = (colId) => {
    const updatedCols = formData.defaultLayout.columns.map(col =>
      col.id === colId ? { ...col, visible: !col.visible } : col
    );
    setFormData({
      ...formData,
      defaultLayout: {
        ...formData.defaultLayout,
        columns: updatedCols
      }
    });
  };

  const filteredTemplates = masterInvoiceTemplates.filter(t => {
    if (activeFilter === 'FREE') return t.tierAccess === 'FREE';
    if (activeFilter === 'PRO') return t.tierAccess === 'PRO_EXCLUSIVE';
    if (activeFilter === 'LIVE') return t.isPublished;
    return true;
  });

  const totalTemplates = masterInvoiceTemplates.length;
  const totalInstalls = masterInvoiceTemplates.reduce((sum, t) => sum + (t.installedCount || 0), 0);
  const proTemplates = masterInvoiceTemplates.filter(t => t.tierAccess === 'PRO_EXCLUSIVE').length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Master Invoice & Tax Receipt Engine
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Manage 6 GST-compliant invoice layouts, custom columns, QR code stamps & merchant distribution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <Plus className="w-4 h-4 stroke-[3]" /> + Create Master Invoice Template
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border space-y-1 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Available Invoice Formats
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>{totalTemplates} Master Formats</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>GST & Tax Ready</span>
          </div>
        </div>


      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-2 p-2 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        {['All', 'FREE', 'PRO', 'LIVE'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === tab ? 'text-black' : ''
            }`}
            style={activeFilter === tab ? {
              background: 'linear-gradient(135deg, #D4A017, #F5C842)',
            } : {
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {tab === 'All' ? 'All Templates' : tab === 'FREE' ? 'Free Tier' : tab === 'PRO' ? 'Pro Exclusive' : 'Live Published'}
          </button>
        ))}
      </div>

      {/* 4. Master Invoice Templates Grid with Live Rendered Mini Invoice Document Front Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
          >
            <div className="p-6 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl font-bold leading-snug transition" style={{ color: 'var(--text-primary)' }}>
                  {template.name}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs ${
                  template.tierAccess === 'PRO_EXCLUSIVE'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-emerald-500 text-white border-emerald-400'
                }`}>
                  {template.tierAccess === 'PRO_EXCLUSIVE' ? '👑 Pro Exclusive' : '✨ Free Tier'}
                </span>
                <button
                  onClick={() => setSelectedTemplateForPreview(template)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs flex items-center gap-1.5 transition text-black cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  <Eye className="w-3.5 h-3.5" /> Full Live Preview
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-4 py-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTemplatePublish(template.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    template.isPublished
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-stone-500/10 text-stone-400 border-stone-500/30'
                  }`}
                >
                  {template.isPublished ? '● Published' : '○ Draft'}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(template)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer text-black"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => deleteMasterInvoiceTemplate(template.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Builder / Customizer Modal */}
      {isBuilderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {editingTemplateId ? 'Edit Master Invoice Template' : 'Create New Master Invoice Format'}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure layout tokens, typography, and default column schemas</p>
                </div>
              </div>
              <button
                onClick={() => setIsBuilderModalOpen(false)}
                className="p-2 rounded-xl transition cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Split Form & Live Preview */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Form Controls */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-4 border-r text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="space-y-1">
                  <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Template Display Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. GST Minimalist Executive Tax Invoice"
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Slug ID *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="gst-minimalist-tax"
                      className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Tier Access</label>
                    <select
                      value={formData.tierAccess}
                      onChange={(e) => setFormData({ ...formData, tierAccess: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                    >
                      <option value="FREE">Free Tier (All Merchants)</option>
                      <option value="PRO_EXCLUSIVE">Pro Exclusive (Subscribers Only)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Clean split layout with itemized HSN/SAC breakdown..."
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none resize-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Layout Customizer Controls */}
                <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h4 className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--accent)' }}>
                    Layout & Brand Customizer
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Header Style</label>
                      <select
                        value={formData.defaultLayout.headerStyle}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultLayout: { ...formData.defaultLayout, headerStyle: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                      >
                        <option value="split_left_right">Split Left/Right</option>
                        <option value="centered_logo">Centered Brand Logo</option>
                        <option value="banner_strip">Full Top Banner Strip</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Font Family</label>
                      <select
                        value={formData.defaultLayout.fontFamily}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultLayout: { ...formData.defaultLayout, fontFamily: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                      >
                        <option value="Inter">Inter (Modern Clean)</option>
                        <option value="Cinzel">Cinzel (Regal Serif)</option>
                        <option value="Playfair Display">Playfair Display (Luxury)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech Monospace)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Accent Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.defaultLayout.accentColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultLayout: { ...formData.defaultLayout, accentColor: e.target.value }
                        })}
                        className="w-8 h-8 rounded-xl cursor-pointer border-0 p-0"
                      />
                      <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{formData.defaultLayout.accentColor}</span>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.defaultLayout.showSignatoryBox}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultLayout: { ...formData.defaultLayout, showSignatoryBox: e.target.checked }
                        })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Authorized Signatory Box</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.defaultLayout.showQrCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          defaultLayout: { ...formData.defaultLayout, showQrCode: e.target.checked }
                        })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>UPI / QR Tracking Stamp</span>
                    </label>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setIsBuilderModalOpen(false)}
                    className="px-4 py-2 rounded-2xl font-semibold transition cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-2xl font-bold text-black shadow-xs flex items-center gap-2 transition cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {editingTemplateId ? 'Save & Sync Template' : 'Publish Template to All Merchants'}
                  </button>
                </div>
              </div>

              {/* Right Live Document Preview Panel */}
              <div className="w-full md:w-1/2 p-6 flex items-center justify-center border-l" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                <div className="w-full max-w-sm rounded-2xl shadow-xl border overflow-hidden p-4 space-y-4 text-xs bg-white text-slate-900">
                  <MiniInvoiceDocumentCard template={formData} />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Full Screen Live Preview Modal */}
      {selectedTemplateForPreview && (
        <InvoiceFullPreviewModal
          isOpen={Boolean(selectedTemplateForPreview)}
          onClose={() => setSelectedTemplateForPreview(null)}
          template={selectedTemplateForPreview}
        />
      )}
    </div>
  );
};
