import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'gojulex_saas_multi_tenant_super_secret_jwt_key_2026');
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}

export const generateToken = (user, impersonatedTenantId = null) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: impersonatedTenantId || user.tenantId,
      impersonatedTenantId: impersonatedTenantId || null,
      isImpersonating: Boolean(impersonatedTenantId)
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    // Signature verification is mandatory — never fall back to jwt.decode,
    // which accepts forged/unsigned tokens (full account takeover)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
    }

    if (!decoded || (!decoded.id && !decoded.email)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token structure.' });
    }

    let user = null;
    if (decoded.id) {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { tenant: true }
      });
    }

    if (!user && decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email.toLowerCase().trim() },
        include: { tenant: true }
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = user;
    req.impersonatedTenantId = decoded.impersonatedTenantId || null;
    req.tenantId = decoded.impersonatedTenantId || user.tenantId || null;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed: ' + error.message });
  }
};

/**
 * Restricts access exclusively to Super Admins (role === 'SUPER_ADMIN')
 */
export const requireSuperAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Super Administrator privileges required.'
      });
    }
  });
};

/**
 * Restricts access to Merchant Owners, Staff, or Super Admin impersonating a merchant.
 * Scopes query by req.tenantId.
 */
export const requireMerchantAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isMerchant = req.user.role === 'MERCHANT_OWNER' || req.user.role === 'MERCHANT_STAFF' || req.user.role === 'ADMIN';

    if (isSuperAdmin || isMerchant) {
      req.tenantId = req.impersonatedTenantId || req.user.tenantId || null;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Merchant credentials or active tenant scope required.'
      });
    }
  });
};

export const requireAdmin = requireMerchantAdmin;
