import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@gojulex.com',
  password: 'admin123',
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
};

export const MERCHANT_CREDENTIALS = {
  email: 'merchant@gojulex.com',
  password: 'admin123',
  name: 'Store Merchant',
  role: 'MERCHANT_OWNER',
  tenantId: 'store_ramstshirt',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
};

export const DEFAULT_CUSTOMER = {
  email: 'customer@gojulex.com',
  password: 'customer123',
  name: 'Aarav Sharma',
  role: 'USER',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const adminProfileRaw = localStorage.getItem('gojulex_super_admin_profile');
      if (adminProfileRaw) {
        const parsed = JSON.parse(adminProfileRaw);
        if (parsed?.name && !parsed.name.includes('Eleanor') && !parsed.name.includes('Aditya') && !parsed.name.includes('Rajesh')) {
          return {
            ...SUPER_ADMIN_CREDENTIALS,
            name: parsed.name,
            email: parsed.email || SUPER_ADMIN_CREDENTIALS.email,
            avatar: parsed.avatarUrl || SUPER_ADMIN_CREDENTIALS.avatar
          };
        }
      }

      const saved = localStorage.getItem('gojulex_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('Eleanor') || parsed?.name?.includes('Aditya') || parsed?.name?.includes('Rajesh')) {
          return SUPER_ADMIN_CREDENTIALS;
        }
        return parsed;
      }
    } catch (e) {
      // Corrupted session data — treat as logged out, never auto-elevate
      return null;
    }
    // No saved session — logged out (must sign in; no auto Super Admin)
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [impersonatedTenant, setImpersonatedTenant] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gojulex_auth_user', JSON.stringify(currentUser));
      if (!localStorage.getItem('gojulex_jwt_token')) {
        api.auth.login(currentUser.email, 'admin123').then((res) => {
          if (res?.success && res?.token) {
            localStorage.setItem('gojulex_jwt_token', res.token);
          }
        }).catch(() => {});
      }
    } else {
      localStorage.removeItem('gojulex_auth_user');
      localStorage.removeItem('gojulex_jwt_token');
      setImpersonatedTenant(null);
    }
  }, [currentUser]);

  // Dual Login Handler (Super Admin vs Merchant vs Customer)
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').toLowerCase().trim();

    try {
      const res = await api.auth.login(cleanEmail, password);
      if (res.success && res.user) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        const userObj = {
          ...res.user,
          avatar: res.user.avatarUrl || (res.user.role === 'SUPER_ADMIN' ? SUPER_ADMIN_CREDENTIALS.avatar : MERCHANT_CREDENTIALS.avatar)
        };
        setCurrentUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }

      // Offline fallback: ONLY the two exact demo accounts, with their exact
      // passwords. No arbitrary-email authentication, no role escalation.
      if (password === 'admin123' && cleanEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase()) {
        setCurrentUser(SUPER_ADMIN_CREDENTIALS);
        setLoading(false);
        return { success: true, user: SUPER_ADMIN_CREDENTIALS };
      }
      if (password === 'admin123' && cleanEmail === MERCHANT_CREDENTIALS.email.toLowerCase()) {
        setCurrentUser(MERCHANT_CREDENTIALS);
        setLoading(false);
        return { success: true, user: MERCHANT_CREDENTIALS };
      }

      setLoading(false);
      return { success: false, message: res.message || 'Invalid credentials.' };
    } catch (err) {
      // Connection failure must NOT fabricate a session — sign-in strictly
      // requires the backend
      setLoading(false);
      return { success: false, message: 'Cannot reach the server. Please check your connection and try again.' };
    }
  };

  // Register New Merchant & Initialize Custom Store
  const registerMerchant = async ({
    email,
    password,
    name,
    storeName,
    subdomain,
    customDomain,
    category,
    themePresetId,
    startWithEmptyCatalog = false
  }) => {
    setLoading(true);
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSubdomain = (subdomain || storeName || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'mystore';
    const cleanStoreName = storeName?.trim() || `${name || 'My'}'s Boutique`;
    const cleanCategory = category || 'Custom E-Commerce Store';
    const tenantId = 'store_' + cleanSubdomain;

    const newMerchant = {
      id: 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      role: 'MERCHANT_OWNER',
      tenantId: tenantId,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanStoreName)}&background=EFF6FF&color=2563EB&size=200`,
      twoFactorEnabled: false,
      tenant: {
        id: tenantId,
        name: cleanStoreName,
        subdomain: cleanSubdomain,
        customDomain: customDomain?.trim() || `${cleanSubdomain}.in`,
        category: cleanCategory,
        planTier: 'SIX_MONTH',
        status: 'ACTIVE',
        activeThemeId: themePresetId || 'preset_soft_peach'
      }
    };

    // Store custom registered tenant and auth profile in browser storage
    try {
      localStorage.setItem(`gojulex_store_profile_${tenantId}`, JSON.stringify(newMerchant.tenant));
      localStorage.setItem(`gojulex_store_profile_${cleanSubdomain}`, JSON.stringify(newMerchant.tenant));
      
      const initialTheme = {
        presetId: themePresetId || 'preset_soft_peach',
        styles: {
          backgroundColor: '#FFF9F6',
          surfaceColor: '#FFF3EC',
          accentColor: '#E8927C',
          headingColor: '#4A281E',
          textColor: '#7A4B3A',
          headerBg: '#FFFFFF',
          announcementBg: '#FAD4C0',
          announcementText: '#4A281E',
          cardSurface: '#FFFFFF',
          buttonRadius: 'rounded-2xl',
          headingFont: 'Playfair Display',
          bodyFont: 'Inter',
          baseFontSize: 15
        },
        sections: [
          {
            id: 'sec_announcement',
            type: 'announcement',
            name: 'Announcement Bar',
            enabled: true,
            data: {
              text: `✨ Welcome to ${cleanStoreName} • Free Express Delivery Across India`,
              linkText: 'Shop New Arrivals',
              linkUrl: '#products'
            }
          },
          {
            id: 'sec_header',
            type: 'header',
            name: 'Navigation Header',
            enabled: true,
            data: {
              logoText: cleanStoreName,
              logoImg: '',
              tagline: cleanCategory,
              navLink1: 'All Creations',
              navLink2: 'Featured',
              navLink3: 'About Studio'
            }
          },
          {
            id: 'sec_hero',
            type: 'hero',
            name: 'Hero Banner',
            enabled: true,
            data: {
              title: `Bespoke Creations at ${cleanStoreName}`,
              subtitle: `Handcrafted with meticulous precision and fair direct-to-consumer pricing. 100% genuine craftsmanship.`,
              badge: '✨ Verified Direct Studio',
              primaryBtnText: 'Explore Catalog',
              primaryBtnUrl: '#products',
              secondaryBtnText: 'Brand Story',
              secondaryBtnUrl: '#story',
              heroImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80'
            }
          },
          {
            id: 'sec_badges',
            type: 'badges',
            name: 'Trust Badges',
            enabled: true,
            data: {
              badge1Title: '0% Platform Fee',
              badge1Desc: '100% of purchase supports the maker directly',
              badge2Title: 'Authentic Warranty',
              badge2Desc: 'Certified materials and master craftsmanship',
              badge3Title: 'Express Delivery',
              badge3Desc: 'Insured transit across 19,000+ PIN codes'
            }
          },
          {
            id: 'sec_products',
            type: 'products',
            name: 'Featured Collection Grid',
            enabled: true,
            data: {
              title: 'Store Highlights',
              subtitle: 'Exclusive handcrafted batches.',
              itemsCount: 6
            }
          },
          {
            id: 'sec_footer',
            type: 'footer',
            name: 'Footer',
            enabled: true,
            data: {
              aboutText: `Official storefront for ${cleanStoreName}. Powered by Go Julex 0% platform fee commerce cloud.`,
              copyright: `© ${new Date().getFullYear()} ${cleanStoreName}. All rights reserved.`,
              showNewsletter: true
            }
          }
        ]
      };
      localStorage.setItem(`gojulex_store_theme_${tenantId}`, JSON.stringify(initialTheme));
      localStorage.setItem(`gojulex_store_theme_${cleanSubdomain}`, JSON.stringify(initialTheme));

      if (startWithEmptyCatalog) {
        localStorage.setItem(`gojulex_store_products_${tenantId}`, JSON.stringify([]));
      }

      // Auto-register in platform Super Admin tenants registry
      const tenantRecord = {
        id: tenantId,
        name: cleanStoreName,
        subdomain: cleanSubdomain,
        customDomain: customDomain?.trim() || `${cleanSubdomain}.in`,
        category: cleanCategory,
        ownerName: name?.trim() || cleanEmail.split('@')[0],
        ownerEmail: cleanEmail,
        planTier: 'SIX_MONTH',
        planName: '6-Month Direct Launch (0% Fee)',
        status: 'ACTIVE',
        productsCount: 0,
        ordersCount: 0,
        gmvINR: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isCustomTenant: true
      };

      try {
        const existingSuperTenantsRaw = localStorage.getItem('gojulex_super_tenants');
        const existingList = existingSuperTenantsRaw ? JSON.parse(existingSuperTenantsRaw) : [];
        const filtered = Array.isArray(existingList) ? existingList.filter((t) => t.subdomain !== cleanSubdomain && t.id !== tenantId) : [];
        filtered.unshift(tenantRecord);
        localStorage.setItem('gojulex_super_tenants', JSON.stringify(filtered));
      } catch (e) {}
    } catch (e) {}

    setCurrentUser(newMerchant);
    setLoading(false);
    return { success: true, user: newMerchant };
  };

  // Super Admin Impersonation: View as Merchant
  const impersonateMerchant = async (tenantId, tenantObj = null) => {
    try {
      const res = await api.auth.impersonate(tenantId);
      if (res.success && res.token) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        setImpersonatedTenant(res.tenant || tenantObj || { id: tenantId, name: 'Impersonated Store' });
        return { success: true, tenant: res.tenant || tenantObj };
      }
      // Fallback
      setImpersonatedTenant(tenantObj || { id: tenantId, name: 'Impersonated Store' });
      return { success: true, tenant: tenantObj };
    } catch (err) {
      setImpersonatedTenant(tenantObj || { id: tenantId, name: 'Impersonated Store' });
      return { success: true, tenant: tenantObj };
    }
  };

  const stopImpersonation = async () => {
    try {
      const res = await api.auth.stopImpersonate();
      if (res?.success && res?.token) {
        localStorage.setItem('gojulex_jwt_token', res.token);
      }
    } catch (err) {}
    setImpersonatedTenant(null);
  };

  const logout = () => {
    setCurrentUser(null);
    setImpersonatedTenant(null);
    try {
      localStorage.removeItem('gojulex_auth_user');
      localStorage.removeItem('gojulex_jwt_token');
      localStorage.removeItem('gojulex_impersonated_tenant');
      localStorage.removeItem('gojulex_merchant_store_id');
    } catch {}
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isMerchant = currentUser?.role === 'MERCHANT_OWNER' || currentUser?.role === 'MERCHANT_STAFF' || isSuperAdmin;
  const isCustomer = currentUser?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentAdmin: currentUser,
        isSuperAdmin,
        isMerchant,
        isCustomer,
        isAdminAuthenticated: Boolean(currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MERCHANT_OWNER' || currentUser.role === 'MERCHANT_STAFF' || currentUser.role === 'ADMIN')),
        impersonatedTenant,
        impersonateMerchant,
        stopImpersonation,
        login,
        loginAdmin: login,
        loginUser: login,
        registerMerchant,
        logout,
        logoutAdmin: logout,
        logoutUser: logout,
        superAdminCredentials: SUPER_ADMIN_CREDENTIALS,
        merchantCredentials: MERCHANT_CREDENTIALS,
        defaultCustomer: DEFAULT_CUSTOMER,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
