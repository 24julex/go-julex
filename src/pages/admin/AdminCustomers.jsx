import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  EyeOff,
  X
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { CustomersTable } from '../../components/admin/customers/CustomersTable';
import { CustomerDetailDrawer } from '../../components/admin/customers/CustomerDetailDrawer';

export const AdminCustomers = () => {
  const { currentStore, customers, addCustomer } = useMerchantAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    postalCode: ''
  });

  const metrics = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter((c) => (Number(c.ordersCount) || 0) > 1);
    const firstTime = customers.filter((c) => (Number(c.ordersCount) || 0) === 1);
    const viewers = customers.filter((c) => (Number(c.ordersCount) || 0) === 0);

    const repeatPercent = total > 0 ? Math.round((repeat.length / total) * 100) : 0;

    return {
      totalCount: total,
      repeatCount: repeat.length,
      repeatPercent,
      firstTimeCount: firstTime.length,
      viewersCount: viewers.length
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = cust.name?.toLowerCase().includes(q);
        const matchEmail = cust.email?.toLowerCase().includes(q);
        const matchPhone = cust.phone?.toLowerCase().includes(q);
        const matchAddress = cust.address?.toLowerCase().includes(q);
        const matchCity = cust.city?.toLowerCase().includes(q);
        const matchState = cust.state?.toLowerCase().includes(q);
        if (
          !matchName &&
          !matchEmail &&
          !matchPhone &&
          !matchAddress &&
          !matchCity &&
          !matchState
        ) {
          return false;
        }
      }

      const count = Number(cust.ordersCount) || 0;
      if (segmentFilter === 'at_least_once' && count !== 1) return false;
      if (segmentFilter === 'more_than_once' && count <= 1) return false;
      if (segmentFilter === 'viewer' && count !== 0) return false;

      return true;
    });
  }, [customers, searchQuery, segmentFilter]);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.email.trim()) return;

    addCustomer({
      ...newCustomerForm,
      memberSince: new Date().toISOString().split('T')[0],
      pastOrders: []
    });

    setNewCustomerForm({
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      address: '',
      postalCode: ''
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Customers & Cohort Segmentation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {metrics.totalCount} Customers
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Audience directory for <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentStore.name}</span> with typo-tolerant search and repeat purchaser intelligence.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Customer
        </button>
      </div>

      {/* 2. Top 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Total Customers</span>
            <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
            {metrics.totalCount}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Registered store accounts</p>
        </div>

        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Repeat Buyers (&gt;1 Order)</span>
            <span className="text-purple-400 font-bold font-mono">{metrics.repeatPercent}% Cohort</span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {metrics.repeatCount}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>High LTV repeat purchasers</p>
        </div>

        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>First-Time Buyers (=1 Order)</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500">
            {metrics.firstTimeCount}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Single completed order</p>
        </div>

        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Viewers / Leads (0 Orders)</span>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-muted)' }}>
            {metrics.viewersCount}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Newsletter / Cart abandoners</p>
        </div>
      </div>

      {/* 3. Search Engine & Dynamic Segmentation Tabs */}
      <div className="p-4 rounded-3xl border space-y-3 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'All', label: `All Customers (${metrics.totalCount})` },
            { id: 'more_than_once', label: `🟣 Repeat Customers (${metrics.repeatCount})` },
            { id: 'at_least_once', label: `🟢 First-Time Buyers (${metrics.firstTimeCount})` },
            { id: 'viewer', label: `⚪ Viewers & Leads (${metrics.viewersCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSegmentFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-2xl font-bold transition whitespace-nowrap cursor-pointer ${
                segmentFilter === tab.id ? 'text-black' : ''
              }`}
              style={segmentFilter === tab.id ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Email, Phone, City, State, or Address..."
            className="w-full pl-10 pr-3 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* 4. Customers Responsive Table */}
      <CustomersTable
        customers={filteredCustomers}
        onSelectCustomer={(cust) => setSelectedCustomer(cust)}
      />

      {/* 5. Customer Profile Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* 6. Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Add New Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Ananya Roy"
                  className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    placeholder="ananya@example.com"
                    className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input
                    type="text"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>City</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>State</label>
                  <input
                    type="text"
                    value={newCustomerForm.state}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border font-semibold transition cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl font-bold text-black shadow-xs transition cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  Save Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
