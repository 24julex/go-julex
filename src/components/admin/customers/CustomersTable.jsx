import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

export const CustomersTable = ({ customers, onSelectCustomer }) => {
  const { showToast } = useMerchantAdmin();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyContact = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied "${text}" to clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSegmentBadge = (ordersCount) => {
    if (ordersCount > 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Repeat Buyer ({ordersCount})
        </span>
      );
    } else if (ordersCount === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          First-Time Buyer
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Viewer / Lead (0)
        </span>
      );
    }
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'CU';
  };

  if (customers.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No customers found matching this criteria</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms or segment filter pills.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            <th className="py-3.5 px-4">Customer Info</th>
            <th className="py-3.5 px-4">Contact Details</th>
            <th className="py-3.5 px-4 text-center">Orders Placed</th>
            <th className="py-3.5 px-4 text-center">Cohort Segment</th>
            <th className="py-3.5 px-4 text-right">Total Spent</th>
            <th className="py-3.5 px-4">Primary Address</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
          {customers.map((cust) => (
            <tr key={cust.id} className="hover:bg-amber-500/5 transition">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  {cust.avatarUrl ? (
                    <img
                      src={cust.avatarUrl}
                      alt={cust.name}
                      className="w-10 h-10 rounded-2xl object-cover border shrink-0"
                      style={{ borderColor: 'var(--border-card)' }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                      {getInitials(cust.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <button
                      onClick={() => onSelectCustomer(cust)}
                      className="font-bold hover:underline text-left block truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cust.name}
                    </button>
                    <span className="text-[10px] block font-normal" style={{ color: 'var(--text-muted)' }}>
                      Member since {cust.memberSince || '2025'}
                    </span>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4 min-w-[190px]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between group">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{cust.email}</span>
                    <button
                      onClick={() => handleCopyContact(cust.email, `${cust.id}_email`)}
                      title="Copy Email"
                      className="opacity-0 group-hover:opacity-100 p-1 transition"
                      style={{ color: 'var(--accent)' }}
                    >
                      {copiedId === `${cust.id}_email` ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>{cust.phone}</span>
                    <button
                      onClick={() => handleCopyContact(cust.phone, `${cust.id}_phone`)}
                      title="Copy Phone"
                      className="opacity-0 group-hover:opacity-100 p-1 transition"
                      style={{ color: 'var(--accent)' }}
                    >
                      {copiedId === `${cust.id}_phone` ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                <span
                  className="inline-block px-2.5 py-1 rounded-xl font-mono font-bold text-xs border"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                >
                  {cust.ordersCount} {cust.ordersCount === 1 ? 'Order' : 'Orders'}
                </span>
              </td>

              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                {getSegmentBadge(cust.ordersCount)}
              </td>

              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-500 whitespace-nowrap">
                ₹{Number(cust.totalSpentINR || 0).toLocaleString('en-IN')}
              </td>

              <td className="py-3.5 px-4 min-w-[200px]">
                <p className="truncate" style={{ color: 'var(--text-primary)' }}>{cust.address || cust.city}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {cust.city}, {cust.state} {cust.postalCode && `• ${cust.postalCode}`}
                </p>
              </td>

              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onSelectCustomer(cust)}
                    title="View Profile / Orders"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> View
                  </button>

                  <a
                    href={`mailto:${cust.email}`}
                    title="Send Direct Email"
                    className="p-1.5 rounded-xl text-black font-bold transition shadow-xs cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
