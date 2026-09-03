import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  X,
  Bell,
  Send,
  AlertCircle,
  Wrench,
  Sparkles,
  DollarSign,
  Eye
} from 'lucide-react';

export const NewBroadcastModal = ({ isOpen, onClose }) => {
  const { createBroadcast, tenants } = useSuperAdmin();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'System Alert',
    targetAudience: 'All Tenants',
    channels: ['in_app', 'email']
  });

  const [activeTab, setActiveTab] = useState('compose');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBroadcast(formData);
    onClose();
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'System Alert':
        return { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-500', icon: AlertCircle, label: 'System Alert' };
      case 'Maintenance':
        return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-500', icon: Wrench, label: 'Maintenance' };
      case 'Feature Update':
        return { bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500', icon: Sparkles, label: 'Feature Update' };
      case 'Billing Reminder':
        return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500', icon: DollarSign, label: 'Billing Notice' };
      default:
        return { bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500', icon: Bell, label: 'Notification' };
    }
  };

  const currentType = getTypeStyle(formData.type);
  const TypeIcon = currentType.icon;

  const targetCount =
    formData.targetAudience === 'Active Only'
      ? tenants.filter((t) => t.status === 'active').length
      : formData.targetAudience === 'Trialing Only'
      ? tenants.filter((t) => t.status === 'trialing').length
      : formData.targetAudience === 'At-Risk Only'
      ? tenants.filter((t) => t.riskFactor === 'high').length
      : tenants.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Compose Platform Broadcast</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Send system notices, maintenance alerts, or product updates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl transition cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 gap-6 text-xs font-semibold" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`py-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'compose' ? 'font-bold' : ''
            }`}
            style={{ borderColor: activeTab === 'compose' ? 'var(--accent)' : 'transparent', color: activeTab === 'compose' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            Compose Message
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'preview' ? 'font-bold' : ''
            }`}
            style={{ borderColor: activeTab === 'preview' ? 'var(--accent)' : 'transparent', color: activeTab === 'preview' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'compose' ? (
            <>
              <div className="space-y-1">
                <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Broadcast Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Festival High-Traffic Concurrency & 0% Fee Readiness"
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Notification Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="System Alert">System Alert (High Priority)</option>
                    <option value="Maintenance">Scheduled Maintenance</option>
                    <option value="Feature Update">Feature Update & Release</option>
                    <option value="Billing Reminder">Billing & Subscription Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="All Tenants">All Tenants ({tenants.length} Stores)</option>
                    <option value="Active Only">Active Paid Tenants Only</option>
                    <option value="Trialing Only">Trialing Tenants Only</option>
                    <option value="At-Risk Only">At-Risk Accounts Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Message Body (Markdown Supported) *</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write clear instructions or system updates..."
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl space-y-2 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${currentType.bg}`}>
                    <TypeIcon className="w-3 h-3" /> {currentType.label}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Targeting: {targetCount} Stores</span>
                </div>
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{formData.title || 'Untitled Broadcast Notification'}</h4>
                <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {formData.message || 'No message body composed yet...'}
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Recipient Count: <strong>{targetCount} Stores</strong></span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-2xl font-semibold transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-2xl font-bold flex items-center gap-1.5 shadow-xs transition text-black cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Broadcast
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
