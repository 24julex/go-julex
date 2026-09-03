import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, ShieldCheck, Check, Camera, Sparkles } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useAuth } from '../../context/AuthContext';

export const EditAdminProfileModal = ({ isOpen, onClose }) => {
  const { activeAdmin, setActiveAdmin, showToast, logAuditEvent } = useSuperAdmin();
  const { currentUser, setCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: activeAdmin?.name || 'Super Admin',
    email: activeAdmin?.email || 'admin@gojulex.com',
    phone: activeAdmin?.phone || '+91 98000 00000',
    role: activeAdmin?.role || 'Super Admin',
    avatarUrl: activeAdmin?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    if (activeAdmin) {
      setFormData({
        name: activeAdmin.name || 'Super Admin',
        email: activeAdmin.email || 'admin@gojulex.com',
        phone: activeAdmin.phone || '+91 98000 00000',
        role: activeAdmin.role || 'Super Admin',
        avatarUrl: activeAdmin.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      });
    }
  }, [activeAdmin, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Admin name cannot be empty', 'error');
      return;
    }

    const updatedProfile = {
      ...activeAdmin,
      ...formData,
      lastSecurityCheck: 'Live Active',
      ipAddress: activeAdmin?.ipAddress || '103.211.54.18'
    };

    // 1. Update Super Admin Context
    if (setActiveAdmin) {
      setActiveAdmin(updatedProfile);
    }

    // 2. Update Auth Context
    if (setCurrentUser) {
      setCurrentUser(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatarUrl
      }));
    }

    // 3. Persist to localStorage
    try {
      localStorage.setItem('gojulex_super_admin_profile', JSON.stringify(updatedProfile));
      const authUserRaw = localStorage.getItem('gojulex_auth_user');
      if (authUserRaw) {
        const parsed = JSON.parse(authUserRaw);
        parsed.name = formData.name;
        parsed.email = formData.email;
        parsed.avatar = formData.avatarUrl;
        localStorage.setItem('gojulex_auth_user', JSON.stringify(parsed));
      }
    } catch {}

    if (logAuditEvent) {
      logAuditEvent('Profile Updated', 'Super Admin Account', 'master_admin', `Updated personal name to "${formData.name}" and email to "${formData.email}"`);
    }

    showToast('Admin profile updated successfully!', 'success');
    onClose();
  };

  const AVATAR_PRESETS = [
    { label: 'Admin Default', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' },
    { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    { label: 'Executive Female', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    { label: 'Modern Minimal', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#FBCBCB] shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-[#FBCBCB] bg-gradient-to-br from-[#FFF1F2] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#0F172A]">Edit Administrator Profile</h2>
              <p className="text-xs text-[#374151]">Manage your administrator name, email, and personal credentials.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#fedddd] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Profile Photo & Avatar
            </label>
            <div className="flex items-center gap-4">
              <img
                src={formData.avatarUrl}
                alt="Avatar Preview"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#BE123C] shadow-sm"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="Custom image URL"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#FBCBCB] text-xs focus:ring-2 focus:ring-[#9F1239]/20 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                        formData.avatarUrl === p.url
                          ? 'bg-[#9F1239] text-white border-[#9F1239] font-bold'
                          : 'bg-[#fedddd] text-[#881337] border-[#F8B4B4] hover:bg-[#FEE2E2]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Name */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Admin Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Super Admin or Your Name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#FBCBCB] text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#9F1239]/20 focus:border-[#9F1239] focus:outline-none"
              />
            </div>
          </div>

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. admin@gojulex.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#FBCBCB] text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#9F1239]/20 focus:border-[#9F1239] focus:outline-none"
              />
            </div>
          </div>

          {/* Phone & Role Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#FBCBCB] text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#9F1239]/20 focus:border-[#9F1239] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                Designation / Role Title
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Super Admin / Root Authority"
                className="w-full px-3 py-2.5 rounded-xl border border-[#FBCBCB] text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#9F1239]/20 focus:border-[#9F1239] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#FBCBCB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
