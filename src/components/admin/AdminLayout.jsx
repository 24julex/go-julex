import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { ProductModal } from './ProductModal';

export const AdminLayout = ({ children }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans antialiased" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Product Add / Edit Modal */}
      <ProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Left Sidebar */}
      <div className="hidden lg:flex flex-col h-full w-64 shrink-0 z-20" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
        <SidebarNav onOpenAddProduct={() => setIsAddModalOpen(true)} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-64 h-full z-10 animate-fade-in shadow-2xl" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
            <SidebarNav
              onOpenAddProduct={() => setIsAddModalOpen(true)}
              onCloseMobile={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <TopHeader
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="max-w-7xl w-full mx-auto space-y-8">
            {children || <Outlet context={{ onOpenAddProduct: () => setIsAddModalOpen(true), globalSearch }} />}
          </div>
        </main>
      </div>
    </div>
  );
};
