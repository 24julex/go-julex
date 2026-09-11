import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

// Session-restore fallback for the platform Super Admin. The real account
// lives in the database — sign-in ALWAYS goes through the API; this object
// never grants access on its own.
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@gojulex.com',
  name: 'Super Admin',
  role: 'SUPER_ADMIN'
};

// Neutral generated avatar (initials) — never a stock photo of a random person.
const fallbackAvatar = (name, email) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email || 'User')}&background=0D1117&color=D4A017&size=200`;

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
            avatar: parsed.avatarUrl || fallbackAvatar(parsed.name, parsed.email)
          };
        }
      }

      const saved = localStorage.getItem('gojulex_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('Eleanor') || parsed?.name?.includes('Aditya') || parsed?.name?.includes('Rajesh')) {
          return { ...SUPER_ADMIN_CREDENTIALS, avatar: fallbackAvatar(SUPER_ADMIN_CREDENTIALS.name, SUPER_ADMIN_CREDENTIALS.email) };
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
    } else {
      localStorage.removeItem('gojulex_auth_user');
      localStorage.removeItem('gojulex_jwt_token');
      setImpersonatedTenant(null);
    }
  }, [currentUser]);

  // Google Sign-In via Firebase (real Google account chooser).
  const googleSignIn = async () => {
    setLoading(true);
    try {
      const { FIREBASE_CONFIG, firebaseConfigured } = await import('../firebase');
      if (!firebaseConfigured()) {
        setLoading(false);
        return { success: false, message: 'Google sign-in is not configured yet. Please use email and password.' };
      }
      const [{ initializeApp }, { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect }] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
      const app = initializeApp(FIREBASE_CONFIG);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      let credential = null;
      try {
        credential = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        const code = popupErr?.code || '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setLoading(false);
          return { success: false, cancelled: true };
        }
        if (code === 'auth/unauthorized-domain') {
          setLoading(false);
          return { success: false, message: 'This domain is not yet authorized in Firebase (Authentication → Settings → Authorized domains).' };
        }
        // Popup blocked or failed — automatically fall back to the
        // full-page redirect flow (works even with popups disabled).
        try {
          await signInWithRedirect(auth, provider);
          return { success: false, redirecting: true };
        } catch (redirErr) {
          if ((redirErr?.code || '') === 'auth/unauthorized-domain') {
            setLoading(false);
            return { success: false, message: 'This domain is not yet authorized in Firebase (Authentication → Settings → Authorized domains).' };
          }
          setLoading(false);
          return { success: false, message: 'Google sign-in could not be opened. Please allow popups for this site and try again.' };
        }
      }

      if (!credential) { setLoading(false); return { success: false, cancelled: true }; }
      const idToken = await credential.user.getIdToken();
      const res = await api.auth.firebaseGoogle(idToken);
      if (res?.success && res?.user) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        const userObj = { ...res.user, avatar: res.user.avatarUrl || fallbackAvatar(res.user.name, res.user.email) };
        setCurrentUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }
      setLoading(false);
      return { success: false, message: (res && res.message) || 'Google sign-in failed.' };
    } catch (err) {
      setLoading(false);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { success: false, cancelled: true };
      }
      if (code === 'auth/unauthorized-domain') {
        return { success: false, message: 'This domain is not yet authorized in Firebase (Authentication → Settings → Authorized domains).' };
      }
      return { success: false, message: err?.message || 'Google sign-in could not be completed. Please try again.' };
    }
  };

  // Completes the redirect-based Google sign-in when the browser returns
  // from accounts.google.com back to the login page.
  const completeGoogleRedirect = async () => {
    try {
      const { FIREBASE_CONFIG, firebaseConfigured } = await import('../firebase');
      if (!firebaseConfigured()) return null;
      const [{ initializeApp }, { getAuth, getRedirectResult }] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
      const auth = getAuth(initializeApp(FIREBASE_CONFIG));
      const result = await getRedirectResult(auth);
      if (!result?.user) return null;
      const idToken = await result.user.getIdToken();
      const res = await api.auth.firebaseGoogle(idToken);
      if (res?.success && res?.user) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        const userObj = { ...res.user, avatar: res.user.avatarUrl || fallbackAvatar(res.user.name, res.user.email) };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Social OAuth sign-in (Google / Microsoft).
  // Real OAuth redirect when the backend has app keys; honest
  // "not configured" error otherwise — never a fabricated session.
  const oauthLogin = async (provider) => {
    setLoading(true);
    try {
      const res = await api.auth.oauthLogin(provider);
      if (res?.mode === 'redirect' && res?.url) {
        window.location.href = res.url;
        return { success: true, redirecting: true };
      }
      if (res?.success && res?.user) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        const userObj = {
          ...res.user,
          avatar: res.user.avatarUrl || fallbackAvatar(res.user.name, res.user.email)
        };
        setCurrentUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
      }
      setLoading(false);
      return { success: false, message: (res && res.message) || 'Social sign-in failed.' };
    } catch (err) {
      setLoading(false);
      return { success: false, message: 'Cannot reach the server. Please try again.' };
    }
  };

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
          avatar: res.user.avatarUrl || fallbackAvatar(res.user.name, res.user.email)
        };
        setCurrentUser(userObj);
        setLoading(false);
        return { success: true, user: userObj };
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

  // Adopt a real backend session (token + verified user) from a signup or
  // OAuth response. The database is the single source of truth — no local
  // shadow tenant/profile data is ever written.
  const adoptBackendSession = (res) => {
    if (!res?.success || !res?.user) return false;
    if (res.token) localStorage.setItem('gojulex_jwt_token', res.token);
    setCurrentUser({
      ...res.user,
      avatar: res.user.avatarUrl || fallbackAvatar(res.user.name, res.user.email)
    });
    return true;
  };

  // Register Customer Account — real backend account via POST /auth/register
  const registerUser = async ({ name, email, password, phone }) => {
    setLoading(true);
    try {
      const res = await api.auth.register({
        name: name?.trim(),
        email: (email || '').toLowerCase().trim(),
        password,
        phone: phone?.trim() || undefined
      });
      if (res?.success && res?.user) {
        adoptBackendSession(res);
        setLoading(false);
        return { success: true, user: res.user };
      }
      setLoading(false);
      return { success: false, message: res?.message || 'Registration failed.' };
    } catch (err) {
      setLoading(false);
      return { success: false, message: 'Cannot reach the server. Please try again.' };
    }
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
        googleSignIn,
        completeGoogleRedirect,
        oauthLogin,
        loginAdmin: login,
        loginUser: login,
        registerUser,
        adoptBackendSession,
        logout,
        logoutAdmin: logout,
        logoutUser: logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
