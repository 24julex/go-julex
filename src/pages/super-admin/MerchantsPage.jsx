import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  Mail,
  Phone,
  Store,
  Key,
  Lock,
  MoreVertical,
  Plus,
  Sparkles
} from 'lucide-react';

export const MerchantsPage = () => {
  const { merchantUsers, impersonateTenant, tenants, showToast, logAuditEvent } = useSuperAdmin();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredMerchants = useMemo(() => {
    return merchantUsers.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.associatedStoreName || m.storeName || '').toLowerCase().includes(q) ||
        m.phone.includes(q);

      const matchesRole =
        roleFilter === 'All' ||
        m.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [merchantUsers, searchQuery, roleFilter]);

  const handleResetPassword = (merchant) => {
    logAuditEvent(
      'Tenant Edited',
      merchant.associatedStoreName || merchant.storeName || merchant.name,
      merchant.associatedStoreId || merchant.tenantId || 'store',
      `Triggered password reset email for merchant: ${merchant.email}`
    );
    showToast(`Password reset link dispatched to ${merchant.email}`, 'info');
  };

  const handleImpersonateUser = (merchant) => {
    let targetStore = tenants.find(
      (t) =>
        t.id === merchant.tenantId ||
        t.id === merchant.associatedStoreId ||
        t.subdomain === merchant.subdomain ||
        t.name?.toLowerCase() === (merchant.storeName || merchant.associatedStoreName || '').toLowerCase() ||
        t.ownerEmail?.toLowerCase() === merchant.email?.toLowerCase()
    );

    if (!targetStore) {
      const storeName = merchant.associatedStoreName || merchant.storeName || merchant.name || 'Store';
      const cleanSub = (merchant.subdomain || merchant.tenantId || storeName).toLowerCase().replace(/^store_/, '').replace(/[^a-z0-9]/g, '') || 'mystore';
      targetStore = {
        id: merchant.tenantId || merchant.associatedStoreId || `store_${cleanSub}`,
        name: storeName,
        subdomain: cleanSub,
        customDomain: `${cleanSub}.in`,
        category: 'Bespoke E-Commerce Store',
        ownerName: merchant.name,
        ownerEmail: merchant.email,
        status: 'active'
      };
    }

    if (targetStore) {
      impersonateTenant(targetStore);
      showToast(`⚡ Impersonating merchant: ${targetStore.name}`, 'info');
      navigate('/admin/dashboard');
    } else {
      showToast('Store instance not found for merchant', 'warning');
    }
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A] tracking-tight">
              Merchants & User Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#fedddd] text-[#881337] border border-[#F8B4B4] text-[10px] font-bold uppercase tracking-wider">
              {merchantUsers.length} Registered Accounts
            </span>
          </div>
          <p className="text-xs text-[#374151] mt-1">
            Global directory of brand founders, store managers, and staff users across all tenant domains.
          </p>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#D4A017] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchants by name, email, phone, or store name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-xs text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-[#374151] uppercase mr-1">Role:</span>
          {['All', 'Store Owner', 'Store Manager', 'Inventory Staff'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-xl font-semibold text-xs transition ${
                roleFilter === role
                  ? 'bg-[#D4A017] text-white shadow-xs'
                  : 'bg-white text-[#881337] hover:bg-[#FEE2E2] border border-[#FBCBCB]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Merchants Table */}
      <div className="bg-white border border-[#FBCBCB] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFE4E6]/60 border-b border-[#FBCBCB] text-[10px] uppercase font-bold text-[#881337] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Merchant Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Associated Store</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FBCBCB]/60 text-[#0F172A]">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-[#FEE2E2]/40 transition">
                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={merchant.avatar || merchant.avatarUrl || merchant.ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(merchant.name || 'Merchant')}&background=FAD4C0&color=9F1239&bold=true`}
                        alt={merchant.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(merchant.name || 'Merchant')}&background=FAD4C0&color=9F1239&bold=true`;
                        }}
                        className="w-8 h-8 rounded-xl object-cover border border-[#FBCBCB] shrink-0 bg-slate-100"
                      />
                      <div className="font-bold text-[#0F172A]">{merchant.name}</div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-[#0F172A]">{merchant.email}</div>
                      <div className="text-[#374151]">{merchant.phone}</div>
                    </div>
                  </td>

                  {/* Store */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#D4A017] flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#D4A017]" />
                      {merchant.associatedStoreName || merchant.storeName || merchant.name}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
                      {merchant.role}
                    </span>
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {merchant.isEmailVerified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <XCircle className="w-3 h-3 text-amber-600" /> Unverified
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        merchant.status === 'active'
                          ? 'bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200'
                          : 'bg-red-50 text-[#9B1C1C] border border-rose-200'
                      }`}
                    >
                      {merchant.status}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 text-[#374151] text-[11px] font-mono">
                    {merchant.lastLogin}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleImpersonateUser(merchant)}
                        className="px-2.5 py-1 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] text-[10px] font-bold transition flex items-center gap-1"
                        title="Impersonate user session"
                      >
                        <UserCheck className="w-3 h-3 text-[#D4A017]" /> Login As
                      </button>
                      <button
                        onClick={() => handleResetPassword(merchant)}
                        className="p-1.5 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] transition"
                        title="Send Password Reset"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
