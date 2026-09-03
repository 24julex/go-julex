import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { TenantDetailDrawer } from '../../components/super-admin/TenantDetailDrawer';
import { AddTenantModal } from '../../components/super-admin/AddTenantModal';
import {
  Search,
  Store,
  Plus,
  UserCheck,
  Globe,
  Eye,
  Download
} from 'lucide-react';

export const TenantsPage = () => {
  const {
    tenants,
    plans,
    impersonateTenant,
  } = useSuperAdmin();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isAddTenantOpen, setAddTenantOpen] = useState(false);

  useEffect(() => {
    const idFromParam = searchParams.get('id');
    const actionFromParam = searchParams.get('action');

    if (idFromParam) {
      setSelectedTenantId(idFromParam);
      setDrawerOpen(true);
    }
    if (actionFromParam === 'create') {
      setAddTenantOpen(true);
    }
  }, [searchParams]);

  const handleOpenDrawer = (tenantId) => {
    setSelectedTenantId(tenantId);
    setDrawerOpen(true);
    setSearchParams({ id: tenantId });
  };

  const handleImpersonate = (e, tenant) => {
    e.stopPropagation();
    impersonateTenant(tenant.id);
    navigate('/admin');
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      (tenant.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.subdomain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.customDomain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.ownerEmail || tenant.admin?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && tenant.status === 'active') ||
      (statusFilter === 'Trialing' && tenant.status === 'trialing') ||
      (statusFilter === 'Free' && tenant.status === 'free') ||
      (statusFilter === 'Suspended' && tenant.status === 'suspended');

    const matchesPlan =
      planFilter === 'All' || tenant.planId === planFilter;

    const matchesCategory =
      categoryFilter === 'All' || tenant.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPlan && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Store Name', 'Subdomain', 'Custom Domain', 'Plan', 'Status', 'GMV (INR)', 'Products', 'Owner Email'];
    const rows = filteredTenants.map(t => [
      t.id,
      t.name,
      t.subdomain,
      t.customDomain || 'N/A',
      t.planName,
      t.status,
      t.gmvINR || 0,
      t.productsCount || 0,
      t.ownerEmail || t.admin?.email || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `julex-stores-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <TenantDetailDrawer
        tenantId={selectedTenantId}
        isOpen={isDrawerOpen}
        onClose={() => { setDrawerOpen(false); setSearchParams({}); }}
      />
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setAddTenantOpen(false)}
      />

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Tenants & Store Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {filteredTenants.length} of {tenants.length} stores
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Search, edit store instances, inspect customer cohorts, and impersonate merchant sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Export CSV
          </button>
          <button
            onClick={() => setAddTenantOpen(true)}
            className="px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <Plus className="w-4 h-4" /> Provision Store
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Box */}
      <div className="p-4 rounded-3xl border space-y-3.5 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Instant Search: store name, domain, admin email, phone, city..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold uppercase mr-1" style={{ color: 'var(--text-muted)' }}>Status:</span>
            {['All', 'Active', 'Trialing', 'Free', 'Suspended'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  statusFilter === status ? 'font-bold text-black' : ''
                }`}
                style={statusFilter === status ? {
                  background: 'linear-gradient(135deg, #D4A017, #F5C842)',
                } : {
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs focus:outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            >
              <option value="All">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Table */}
      <div className="border rounded-3xl overflow-hidden shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <tr>
                <th className="py-3.5 px-4">Store Tenant</th>
                <th className="py-3.5 px-4">Domain & URLs</th>
                <th className="py-3.5 px-4">Catalog</th>
                <th className="py-3.5 px-4">Plan Badge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Merchant Admin</th>
                <th className="py-3.5 px-4">Platform GMV</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  onClick={() => handleOpenDrawer(tenant.id)}
                  className="hover:bg-amber-500/5 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={(tenant.logoUrl || tenant.logo || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80')}
                        alt={tenant.name}
                        className="w-9 h-9 rounded-xl object-cover border shrink-0"
                        style={{ borderColor: 'var(--border-card)' }}
                      />
                      <div>
                        <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span>{tenant.name}</span>
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          <span>{tenant.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {tenant.customDomain ? (
                      <div className="flex items-center gap-1 text-emerald-500 font-medium">
                        <Globe className="w-3 h-3 text-emerald-500" />
                        <span>{tenant.customDomain}</span>
                      </div>
                    ) : (
                      <div className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {tenant.subdomain}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)' }}>
                      📦 {tenant.productsCount ?? 0} Listed
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
                      {tenant.planName}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      {tenant.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{(tenant.admin?.name || tenant.ownerName || '')}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{(tenant.admin?.email || tenant.ownerEmail || '')}</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold font-mono" style={{ color: 'var(--accent)' }}>
                    ₹{(tenant.gmvINR ?? 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleImpersonate(e, tenant)}
                        className="px-2.5 py-1 rounded-xl font-bold text-[10px] transition flex items-center gap-1 text-black cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                      >
                        <UserCheck className="w-3 h-3" /> Impersonate
                      </button>
                      <button
                        onClick={() => handleOpenDrawer(tenant.id)}
                        className="p-1.5 rounded-xl transition cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
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
