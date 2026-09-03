import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
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

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setNewBroadcastOpen(true);
    }
  }, [searchParams]);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'System Alert':
        return 'bg-red-50 text-[#9B1C1C] border-rose-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Feature Update':
        return 'bg-[#fedddd] text-[#881337] border-[#F8B4B4]';
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
            <span className="px-2.5 py-0.5 rounded-full bg-[#fedddd] text-[#881337] border border-[#F8B4B4] text-[10px] font-bold uppercase tracking-wider">
              Multi-Channel Dispatch
            </span>
          </div>
          <p className="text-xs text-[#374151] mt-1">
            Dispatch urgent system alerts, feature releases, maintenance windows, or billing notices across active tenants.
          </p>
        </div>

        <button
          onClick={() => setNewBroadcastOpen(true)}
          className="px-4 py-2 rounded-2xl bg-[#D4A017] hover:bg-[#881337] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
        >
          <Send className="w-3.5 h-3.5" /> Compose New Broadcast
        </button>
      </div>

      {/* 2. Broadcast Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#D4A017] shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">Total Sent</span>
            <div className="text-lg font-bold text-[#0F172A] font-mono">{broadcasts.length} Broadcasts</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] border border-emerald-200 flex items-center justify-center text-[#2D6A4F] shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">Avg Delivery Rate</span>
            <div className="text-lg font-bold text-emerald-800 font-mono">99.4% Delivered</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#881337] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">Active Audience Reach</span>
            <div className="text-lg font-bold text-[#0F172A] font-mono">{tenants.length} Merchant Stores</div>
          </div>
        </div>
      </div>

      {/* 3. Recent Broadcasts History */}
      <div className="bg-white border border-[#FBCBCB] rounded-3xl p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-[#0F172A] font-serif">Broadcast History & Delivery Telemetry</h3>

        <div className="space-y-3">
          {broadcasts.map((bc) => (
            <div
              key={bc.id}
              className="p-4 rounded-2xl bg-white border border-[#FBCBCB] hover:border-[#BE123C] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
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

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#FBCBCB] w-full sm:w-auto">
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
