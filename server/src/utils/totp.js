import crypto from 'crypto';

// RFC 6238 TOTP (Google Authenticator compatible) — dependency-free,
// built on node:crypto. 6 digits, SHA-1, 30-second step, and the
// previous step is also accepted to tolerate clock drift.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const generateTotpSecret = (bytes = 20) => {
  const buf = crypto.randomBytes(bytes);
  let bits = 0, value = 0, output = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
};

const totpAtStep = (secretBuffer, step) => {
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(step / 0x100000000), 0);
  counter.writeUInt32BE(step % 0x100000000, 4);
  const digest = crypto.createHmac('sha1', secretBuffer).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;
  return String(code).padStart(6, '0');
};

// Timing-safe comparison of the presented code against the expected one.
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const verifyTotp = (secret, code, windowSteps = 1) => {
  const clean = String(code || '').replace(/\D/g, '');
  if (!secret || clean.length !== 6) return false;
  const secretBuffer = base32Decode(secret);
  if (!secretBuffer.length) return false;
  const step = Math.floor(Date.now() / 30000);
  for (let i = -windowSteps; i <= windowSteps; i++) {
    if (safeEqual(totpAtStep(secretBuffer, step + i), clean)) return true;
  }
  return false;
};

export const totpAuthUrl = (secret, accountLabel) =>
  `otpauth://totp/${encodeURIComponent(`Go Julex:${accountLabel}`)}?secret=${secret}&issuer=${encodeURIComponent('Go Julex')}&algorithm=SHA1&digits=6&period=30`;
