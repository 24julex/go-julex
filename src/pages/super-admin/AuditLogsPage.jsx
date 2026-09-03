import React, { useState, useMemo } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  ShieldCheck,
  Search,
  Download
} from 'lucide-react';

export const AuditLogsPage = () => {
  const { auditLogs } = useSuperAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.adminName.toLowerCase().includes(q) ||
        log.adminEmail.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        (log.targetTenantName && log.targetTenantName.toLowerCase().includes(q)) ||
        log.reason.toLowerCase().includes(q) ||
        log.ipAddress.includes(q);

      const matchesAction =
        actionFilter === 'All' ||
        log.actionType.toLowerCase().includes(actionFilter.toLowerCase());

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const handleExportCSV = () => {
    const headers = 'Audit ID,Timestamp,Admin Name,Admin Email,Action Type,Target Store,IP Address,Reason\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.adminName}","${l.adminEmail}","${l.actionType}","${
            l.targetTenantName || 'System'
          }","${l.ipAddress}","${l.reason.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `super-admin-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Master Security Audit Stream
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              Live Security Telemetry
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Cryptographically logged administrator actions, tenant impersonations, plan mutations, and security events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
        >
          <Download className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Export CSV Audit Log
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-3xl border space-y-3.5 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit logs by admin name, email, target store, action..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold uppercase mr-1" style={{ color: 'var(--text-muted)' }}>Action Type:</span>
          {['All', 'Impersonate', 'Status', 'Plan', 'Broadcast', '2FA', 'Feature'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1 rounded-xl font-semibold text-xs transition cursor-pointer ${
                actionFilter === act ? 'font-bold text-black' : ''
              }`}
              style={actionFilter === act ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
              }}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Audit Table */}
      <div className="border rounded-3xl overflow-hidden shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action Performed</th>
                <th className="py-3.5 px-4">Target Tenant / Context</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={log.adminAvatar}
                        alt={log.adminName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        style={{ border: '1px solid var(--border-card)' }}
                      />
                      <div>
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{log.adminName}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{log.adminEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)' }}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {log.targetTenantName ? (
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>@{log.targetTenantName}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Global System</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {log.reason}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {log.ipAddress}
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
