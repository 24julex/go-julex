import express from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { generateToken, requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// ----------------------------------------------------
// 1. Dual Login (Super Admin & Merchant)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { tenant: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User does not exist.' });
    }

    // Strict credential check — no universal password backdoors.
    // bcrypt.compare alone decides; a null passwordHash (OAuth-only account)
    // can never log in via password.
    const isMatch = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = generateToken(user);

    // Audit log if Super Admin
    if (user.role === 'SUPER_ADMIN') {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: 'SUPER_ADMIN_LOGIN',
          entityType: 'AUTH',
          entityId: user.id,
          ipAddress: req.ip || '127.0.0.1'
        }
      });
    }

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
        tenant: user.tenant || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
});

// ----------------------------------------------------
// 2. Super Admin Impersonation: "View as Merchant"
// ----------------------------------------------------
router.post('/impersonate', requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.body;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Target tenantId is required.' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { invoiceConfig: true }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Target tenant store not found.' });
    }

    // Generate impersonation token with claim
    const impersonationToken = generateToken(req.user, tenant.id);

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'SUPER_ADMIN_IMPERSONATION_START',
        entityType: 'TENANT',
        entityId: tenant.id,
        detailsJson: JSON.stringify({
          tenantName: tenant.name,
          subdomain: tenant.subdomain,
          timestamp: new Date().toISOString()
        }),
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({
      success: true,
      token: impersonationToken,
      tenant,
      message: `Now viewing as Merchant: ${tenant.name} (${tenant.subdomain})`
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    return res.status(500).json({ success: false, message: 'Error initiating impersonation session.' });
  }
});

// ----------------------------------------------------
// 3. Stop Impersonation & Return to Super Admin
// ----------------------------------------------------
router.post('/stop-impersonate', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Not in a Super Admin impersonation session.' });
    }

    const standardToken = generateToken(req.user, null);

    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'SUPER_ADMIN_IMPERSONATION_END',
        entityType: 'AUTH',
        entityId: req.user.id,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({
      success: true,
      token: standardToken,
      message: 'Impersonation ended. Returned to Master Super Admin console.'
    });
  } catch (error) {
    console.error('Stop impersonate error:', error);
    return res.status(500).json({ success: false, message: 'Error ending impersonation.' });
  }
});

// ----------------------------------------------------
// 4. Get Current User Session (`/api/auth/me`)
// ----------------------------------------------------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tenant: {
          include: { invoiceConfig: true }
        }
      }
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: req.tenantId || user.tenantId,
        isImpersonating: Boolean(req.impersonatedTenantId),
        impersonatedTenantId: req.impersonatedTenantId || null,
        avatarUrl: user.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
        tenant: user.tenant || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching session data.' });
  }
});

// ----------------------------------------------------
// 5. Register Customer Account
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        phone: phone || null,
        role: 'USER',
        avatarUrl: null
      }
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

// ----------------------------------------------------
// OAuth (Google & Microsoft)
// ----------------------------------------------------
const OAUTH_PROVIDERS = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile'
  },
  microsoft: {
    clientId: () => process.env.MICROSOFT_CLIENT_ID,
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
    scope: 'openid email profile'
  }
};

const originUrl = (req) => process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

const findOrCreateOAuthMerchant = async ({ email, name, avatarUrl, provider }) => {
  const cleanEmail = email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email: cleanEmail }, include: { tenant: true } });
  if (user) {
    // Existing user without a store (e.g. OTP shell) — create their store now
    if (!user.tenantId) {
      const sub = ('oauth' + cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'oauthstore';
      const tenant = await prisma.tenant.create({
        data: {
          id: `store_${sub}`,
          name: `${(name || 'My Brand').split(' ')[0]}'s Store`,
          subdomain: `${sub}.go.julex.shop`,
          category: 'Custom E-Commerce Store',
          planTier: 'FREE',
          status: 'DRAFT'
        }
      });
      user = await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id },
        include: { tenant: true }
      });
    }
    return user;
  }

  const subdomain = ('oauth' + cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'oauthstore';
  const tenantId = `store_${subdomain}`;
  let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    try {
      tenant = await prisma.tenant.create({
        data: {
          id: tenantId,
          name: `${(name || 'My Brand').split(' ')[0]}'s Store`,
          subdomain: `${subdomain}.go.julex.shop`,
          category: 'Custom E-Commerce Store',
          planTier: 'FREE',
          status: 'DRAFT'
        }
      });
    } catch (e) {
      if (e.code !== 'P2002') throw e;
      tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    }
  }
  try {
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        // Random password — this account can only sign in via OAuth
        passwordHash: await bcrypt.hash(randomBytes(24).toString('hex'), 10),
        name: name || provider,
        role: 'MERCHANT_OWNER',
        tenantId: tenant.id,
        avatarUrl: avatarUrl || null
      },
      include: { tenant: true }
    });
  } catch (e) {
    console.error('OAuth user create failed:', e.code, e.meta || e.message);
    throw e;
  }
  return user;
};

const oauthSession = (user) => ({
  success: true,
  token: generateToken(user),
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    tenantId: user.tenantId,
    tenant: user.tenant || null
  }
});

// Google Sign-In via Firebase: the frontend signs in with the Firebase SDK
// (Google account chooser) and posts the ID token here. We verify it with
// Google's Identity Toolkit, then create/login the merchant from the verified
// profile — no client secrets in the browser.
router.post('/oauth/firebase-google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!idToken || !apiKey) {
      return res.status(503).json({ success: false, message: 'Google sign-in is not configured yet. Please use email and password.' });
    }
    const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await lookupRes.json();
    const user = data && data.users && data.users[0];
    if (!user || !user.email) {
      return res.status(401).json({ success: false, message: 'Google sign-in could not be verified. Please try again.' });
    }
    const account = await findOrCreateOAuthMerchant({
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      avatarUrl: user.photoUrl || null,
      provider: 'google'
    });
    return res.json(oauthSession(account));
  } catch (error) {
    console.error('Firebase Google sign-in error:', error);
    return res.status(500).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
});


// Button click — real redirect when configured, honest
// "not configured" error otherwise (never a fabricated session)
router.post('/oauth/:provider', async (req, res) => {
  const cfg = OAUTH_PROVIDERS[(req.params.provider || '').toLowerCase()];
  if (!cfg) return res.status(400).json({ success: false, message: 'Unsupported provider.' });

  try {
    if (cfg.clientId()) {
      const redirectUri = `${originUrl(req)}/api/auth/oauth/${req.params.provider}/callback`;
      const url = new URL(cfg.authUrl);
      url.searchParams.set('client_id', cfg.clientId());
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', cfg.scope);
      // Always show the real account chooser, never silently reuse a session
      url.searchParams.set('prompt', 'select_account');
      url.searchParams.set('state', randomBytes(12).toString('hex'));
      return res.json({ success: true, mode: 'redirect', url: url.toString() });
    }
    // No OAuth app keys configured — never fabricate accounts or stores.
    const label = req.params.provider === 'google' ? 'Google' : 'Microsoft';
    return res.status(503).json({
      success: false,
      message: `${label} sign-in is not configured yet. Please use email and password.`
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).json({ success: false, message: 'OAuth sign-in failed.' });
  }
});

// Real OAuth callback — exchange code, fetch profile, create/find merchant, bounce to app
router.get('/oauth/:provider/callback', async (req, res) => {
  const provider = (req.params.provider || '').toLowerCase();
  const cfg = OAUTH_PROVIDERS[provider];
  if (!cfg || !cfg.clientId()) {
    return res.redirect(`${originUrl(req)}/admin/login?oauth_error=1`);
  }
  // User closed the chooser or clicked "Cancel" — not an error
  if (req.query.error === 'access_denied' || req.query.error === 'consent_required' || req.query.error === 'login_required') {
    return res.redirect(`${originUrl(req)}/admin/login?oauth_cancelled=1`);
  }
  if (!req.query.code) {
    return res.redirect(`${originUrl(req)}/admin/login?oauth_error=1`);
  }
  try {
    const redirectUri = `${originUrl(req)}/api/auth/oauth/${provider}/callback`;
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId(),
        client_secret: process.env[provider === 'google' ? 'GOOGLE_CLIENT_SECRET' : 'MICROSOFT_CLIENT_SECRET'] || '',
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('token exchange failed');
    const profileRes = await fetch(cfg.userInfoUrl, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileRes.json();
    const email = profile.email;
    if (!email) throw new Error('no email in profile');
    const user = await findOrCreateOAuthMerchant({
      email,
      name: profile.name || profile.given_name || email.split('@')[0],
      avatarUrl: profile.picture || null,
      provider
    });
    const session = oauthSession(user);
    const params = new URLSearchParams({ oauth_token: session.token, role: session.user.role });
    return res.redirect(`${originUrl(req)}/login?${params.toString()}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(`${originUrl(req)}/admin/login?oauth_error=1`);
  }
});

// Create Store signup: creates the REAL tenant + owner account in the
// database so the merchant can actually log in with email + password.
// ----------------------------------------------------
// Email OTP verification
// ----------------------------------------------------
const { sendMail, otpEmailHtml } = await import('../utils/mailer.js');

const OTP_TTL_MIN = 10;
const OTP_RESEND_COOLDOWN_SEC = 60;
const OTP_MAX_ATTEMPTS = 5;

const genOtp = () => String(100000 + Math.floor(Math.random() * 900000));

// POST /api/auth/otp/send  { email }
// Creates/updates the account with a fresh OTP. Rate limited.
router.post('/otp/send', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    let user = await prisma.user.findUnique({ where: { email } });
    if (user?.emailVerified) {
      return res.json({ success: true, message: 'Email already verified — please sign in.', alreadyVerified: true });
    }
    if (user?.otpLastSentAt && (Date.now() - new Date(user.otpLastSentAt).getTime()) < OTP_RESEND_COOLDOWN_SEC * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait a minute before requesting another code.' });
    }
    const code = genOtp();
    const otpHash = await bcrypt.hash(code, 10);
    if (!user) {
      user = await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash(randomBytes(24).toString('hex'), 10), name: email.split('@')[0], role: 'MERCHANT_OWNER' }
      });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { otpHash, otpExpiresAt: new Date(Date.now() + OTP_TTL_MIN * 60000), otpAttempts: 0, otpLastSentAt: new Date() }
    });
    const mail = await sendMail({
      to: email,
      subject: `Your Go Julex verification code: ${code}`,
      text: `Your Go Julex verification code is ${code}. It expires in ${OTP_TTL_MIN} minutes.`,
      html: otpEmailHtml(code)
    });
    // When SMTP is unavailable (dev), reveal the code in the response so the
    // flow stays testable. NEVER do this in production — gated by NODE_ENV.
    // Dev-only convenience: reveal the code when SMTP is down AND explicitly
    // enabled via ALLOW_DEV_OTP=1 (never set in production).
    const devCode = (!mail.sent && process.env.ALLOW_DEV_OTP === '1') ? code : undefined;
    return res.json({
      success: true,
      message: mail.sent
        ? `Verification code sent to ${email}. It expires in ${OTP_TTL_MIN} minutes.`
        : 'Could not send the email right now — please try again shortly.',
      emailSent: mail.sent,
      ...(devCode ? { devCode } : {})
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return res.status(500).json({ success: false, message: 'Could not send the verification code.' });
  }
});

// POST /api/auth/otp/verify  { email, code }
// Marks the email verified. Resets attempts; invalidates the OTP.
router.post('/otp/verify', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const code = String(req.body?.code || '').trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'Request a verification code first.' });
    }
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Request a new code.' });
    }
    if (new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Request a new one.' });
    }
    const ok = await bcrypt.compare(code, user.otpHash);
    if (!ok) {
      await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
      const left = OTP_MAX_ATTEMPTS - (user.otpAttempts + 1);
      return res.status(401).json({ success: false, message: `Incorrect code. ${left > 0 ? left + ' attempt(s) left.' : 'Request a new code.'}` });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpHash: null, otpExpiresAt: null, otpAttempts: 0 }
    });
    return res.json({ success: true, message: 'Email verified! Continue creating your store.' });
  } catch (error) {
    console.error('OTP verify error:', error);
    return res.status(500).json({ success: false, message: 'Could not verify the code.' });
  }
});

// POST /api/auth/otp/status  { email } — light probe for the UI
router.post('/otp/status', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    return res.json({ success: true, verified: Boolean(user?.emailVerified) });
  } catch (e) {
    return res.json({ success: true, verified: false });
  }
});

router.post('/signup-store', async (req, res) => {
  try {
    const { name, email, password, storeName, category } = req.body || {};
    if (!email || !password || !storeName) {
      return res.status(400).json({ success: false, message: 'Store name, email and password are required.' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    // Email must be OTP-verified before an account can be created
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!existingUser?.emailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email with the OTP code first.', needsVerification: true });
    }
    // A verified shell (created during OTP) is ADOPTED: set the real password
    // and profile instead of rejecting as duplicate.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, name: (name && String(name).trim()) || String(storeName).trim() }
      });
    }

    const { makeSlug, validateSlug, uniqueSlug } = await import('../utils/slug.js');
    const desired = makeSlug(storeName);
    const slugErr = validateSlug(desired);
    if (slugErr) return res.status(400).json({ success: false, message: slugErr });
    const uniq = await uniqueSlug(prisma, desired);
    if (uniq.error) return res.status(409).json({ success: false, message: uniq.error });

    const tenant = await prisma.tenant.create({
      data: {
        id: `store_${uniq.slug}`,
        name: String(storeName).trim(),
        subdomain: `${uniq.slug}.go.julex.shop`,
        category: category || 'Custom E-Commerce Store',
        planTier: 'FREE',
        // New stores start UNPUBLISHED — they only go live after plan
        // payment + publishing (legacy stores keep their ACTIVE status).
        status: 'DRAFT'
      }
    });

    const user = existingUser
      ? await prisma.user.findUnique({ where: { id: existingUser.id }, include: { tenant: true } })
      : await prisma.user.create({
          data: {
            email: cleanEmail,
            passwordHash,
            name: (name && String(name).trim()) || String(storeName).trim(),
            role: 'MERCHANT_OWNER',
            tenantId: tenant.id
          },
          include: { tenant: true }
        });

    return res.status(201).json({
      success: true,
      message: `Store created — ${tenant.subdomain}`,
      token: generateToken(user),
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        tenantId: user.tenantId, tenant: user.tenant
      },
      store: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain, slug: uniq.slug }
    });
  } catch (error) {
    console.error('Signup-store error:', error);
    return res.status(500).json({ success: false, message: 'Could not create the store. Please try again.' });
  }
});

// ----------------------------------------------------
// 6. Update User Profile
// ----------------------------------------------------
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, address, avatarUrl } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { tenant: true }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        phone: updated.phone,
        address: updated.address,
        avatarUrl: updated.avatarUrl,
        tenantId: updated.tenantId,
        twoFactorEnabled: updated.twoFactorEnabled,
        tenant: updated.tenant || null
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ----------------------------------------------------
// 7. Change Password
// ----------------------------------------------------
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash }
    });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// ----------------------------------------------------
// 8. List All Users (Super Admin / Admin only)
// ----------------------------------------------------
router.get('/users', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'MERCHANT_OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const where = req.user.role === 'SUPER_ADMIN' ? {} : { tenantId: req.tenantId };
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { id: true, name: true, subdomain: true } } }
    });

    return res.json({
      success: true,
      count: users.length,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        twoFactorEnabled: u.twoFactorEnabled,
        tenantId: u.tenantId,
        tenant: u.tenant,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list users.' });
  }
});

export default router;
