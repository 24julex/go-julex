import io

p = 'src/context/AuthContext.jsx'
s = open(p, encoding='utf-8').read()

old = """      const [{ initializeApp }, { getAuth, GoogleAuthProvider, signInWithPopup }] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
      const app = initializeApp(FIREBASE_CONFIG);
      const auth = getAuth(app);
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      const res = await api.auth.firebaseGoogle(idToken);
      if (res?.success && res?.user) {
        localStorage.setItem('gojulex_jwt_token', res.token);
        const userObj = { ...res.user, avatar: res.user.avatarUrl || MERCHANT_CREDENTIALS.avatar };
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
      return { success: false, message: 'Google sign-in could not be completed. Please try again.' };
    }
  };"""

new = """      const [{ initializeApp }, { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect }] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
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
        const userObj = { ...res.user, avatar: res.user.avatarUrl || MERCHANT_CREDENTIALS.avatar };
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
        const userObj = { ...res.user, avatar: res.user.avatarUrl || MERCHANT_CREDENTIALS.avatar };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
      return null;
    } catch (e) {
      return null;
    }
  };"""

assert old in s, 'google flow block not found'
s = s.replace(old, new, 1)
s = s.replace("        login,\n        googleSignIn,", "        login,\n        googleSignIn,\n        completeGoogleRedirect,", 1)
open(p, 'w', encoding='utf-8').write(s)

p2 = 'src/pages/AdminLoginPage.jsx'
u = open(p2, encoding='utf-8').read()
u = u.replace(
    "const { loginAdmin, registerMerchant, oauthLogin, googleSignIn } = useAuth();",
    "const { loginAdmin, registerMerchant, oauthLogin, googleSignIn, completeGoogleRedirect } = useAuth();", 1)

hook_old = "  // Real-OAuth callback: backend redirects back with ?oauth_token=...\n  useEffect(() => {"
hook_new = """  // Returning from the Google full-page redirect — finish the sign-in
  useEffect(() => {
    let cancelled = false;
    completeGoogleRedirect().then((res) => {
      if (!cancelled && res?.success) {
        window.location.href = res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-OAuth callback: backend redirects back with ?oauth_token=...
  useEffect(() => {"""
assert hook_old in u, 'hook anchor'
u = u.replace(hook_old, hook_new, 1)

btn_old = """                        const res = await googleSignIn();
                        if (res?.success) {
                          navigate(res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin');
                        } else if (!res?.cancelled) {
                          setError(res?.message || 'Google sign-in failed.');
                        }
                        setLoading(false);"""
btn_new = """                        const res = await googleSignIn();
                        if (res?.redirecting) return; // full-page redirect in progress
                        if (res?.success) {
                          navigate(res.user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin');
                        } else if (!res?.cancelled) {
                          setError(res?.message || 'Google sign-in failed.');
                        }
                        setLoading(false);"""
assert btn_old in u, 'button anchor'
u = u.replace(btn_old, btn_new, 1)
open(p2, 'w', encoding='utf-8').write(u)
print('all patched')
