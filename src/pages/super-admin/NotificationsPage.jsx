import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { api } from '../../services/api';
import { NewBroadcastModal } from '../../components/super-admin/NewBroadcastModal';
import {
  Bell,
  Send,
  Plus,
  AlertCircle,
  Wrench,
  Sparkles,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  Radio,
  Eye,
  Trash2
} from 'lucide-react';

export const NotificationsPage = () => {
  const { broadcasts, tenants, showToast } = useSuperAdmin();
  const [searchParams] = useSearchParams();
  const [isNewBroadcastOpen, setNewBroadcastOpen] = useState(false);

  // Live account activity (merchant signups & deletions) from the backend
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadActivity = useCallback(async () => {
    try {
      const res = await api.superAdmin.getAdminNotifications();
      if (res?.success && Array.isArray(res.data)) {
        setActivity(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      /* portal stays usable even if the feed fails */
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setNewBroadcastOpen(true);
    }
  }, [searchParams]);

  const markRead = async (id) => {
    try {
      await api.superAdmin.markAdminNotificationRead(id);
      setActivity((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      showToast('Could not mark as read.', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.superAdmin.markAllAdminNotificationsRead();
      setActivity((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      showToast('Could not mark all as read.', 'error');
    }
  };

  const activityTypeMeta = (type) => {
    switch (type) {
      case 'MERCHANT_SIGNUP':
        return { icon: Users, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'New Account' };
      case 'ACCOUNT_DELETED':
        return { icon: Trash2, cls: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Account Deleted' };
      default:
        return { icon: Bell, cls: 'bg-slate-100 text-slate-700 border-slate-200', label: type || 'System' };
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'System Alert':
        return 'bg-red-50 text-[#9B1C1C] border-rose-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Feature Update':
        return 'bg-[#FFFDF5] text-[#6B4D00] border-[#DCC78B]';
      case 'Billing Reminder':
        return 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200';
      default:
        return 'bg-slate-100 text-[#374151] border-stone-200';
    }
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Modal */}
      <NewBroadcastModal
        isOpen={isNewBroadcastOpen}
        onClose={() => setNewBroadcastOpen(false)}
      />

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A] tracking-tight">
              Notifications & Broadcast Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF5] text-[#6B4D00] border border-[#DCC78B] text-[10px] font-bold uppercase tracking-wider">
              Multi-Channel Dispatch
            </span>
          </div>
          <p className="text-xs text-[#374151] mt-1">
            Dispatch urgent system alerts, feature releases, maintenance windows, or billing notices across active tenants.
          </p>
        </div>

        <button
          onClick={() => setNewBroadcastOpen(true)}
          className="px-4 py-2 rounded-2xl bg-[#D4A017] hover:bg-[#6B4D00] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
        >
          <Send className="w-3.5 h-3.5" /> Compose New Broadcast
        </button>
      </div>

      {/* 2. Broadcast Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E7D9B5] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#FFFDF5] border border-[#DCC78B] flex items-center justify-center text-[#D4A017] shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4D00]">Total Sent</span>
            <div className="text-lg font-bold text-[#0F172A] font-mono">{broadcasts.length} Broadcasts</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E7D9B5] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] border border-emerald-200 flex items-center justify-center text-[#2D6A4F] shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4D00]">Avg Delivery Rate</span>
            <div className="text-lg font-bold text-emerald-800 font-mono">99.4% Delivered</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E7D9B5] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#FFFDF5] border border-[#DCC78B] flex items-center justify-center text-[#6B4D00] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B4D00]">Active Audience Reach</span>
            <div className="text-lg font-bold text-[#0F172A] font-mono">{tenants.length} Merchant Stores</div>
          </div>
        </div>
      </div>

      {/* 2b. Account Activity — live merchant signups & deletions */}
      <div className="bg-white border border-[#E7D9B5] rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-[#0F172A] font-serif">Account Activity</h3>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#DCC78B] text-[#6B4D00] text-[11px] font-bold hover:bg-amber-50 transition cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {activityLoading ? (
          <p className="text-xs text-stone-500 py-2">Loading account activity…</p>
        ) : activity.length === 0 ? (
          <p className="text-xs text-stone-500 py-2">No account activity yet — new merchant signups and account deletions will appear here.</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {activity.map((n) => {
              const meta = activityTypeMeta(n.type);
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${n.isRead ? 'bg-white border-[#EFE2BC]' : `${meta.cls} shadow-sm`}`}
                >
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.cls}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{meta.label}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    </div>
                    <p className="text-xs text-[#0F172A] leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/70 border border-current/20 text-[10px] font-bold shrink-0 hover:bg-white transition cursor-pointer"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Recent Broadcasts History */}
      <div className="bg-white border border-[#E7D9B5] rounded-3xl p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-[#0F172A] font-serif">Broadcast History & Delivery Telemetry</h3>

        <div className="space-y-3">
          {broadcasts.map((bc) => (
            <div
              key={bc.id}
              className="p-4 rounded-2xl bg-white border border-[#E7D9B5] hover:border-[#A87A00] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTypeStyle(bc.type)}`}>
                    {bc.type}
                  </span>
                  <h4 className="font-bold text-[#0F172A] text-sm">{bc.title}</h4>
                </div>
                <p className="text-[11px] text-[#374151] leading-relaxed">{bc.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#374151] pt-1">
                  <span>
                    Sent by: <strong className="text-[#0F172A]">{bc.sentBy}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Target: <strong className="text-[#D4A017]">{bc.targetAudience}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Channels: <strong className="text-[#0F172A]">{bc.channels.join(', ').toUpperCase()}</strong>
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E7D9B5] w-full sm:w-auto">
                <span className="font-mono text-emerald-800 font-bold text-xs">
                  {bc.deliveredCount} Delivered ({bc.openRatePercent}% open)
                </span>
                <span className="text-[10px] text-[#374151] font-mono">{bc.sentAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
