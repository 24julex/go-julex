import nodemailer from 'nodemailer';

// ----------------------------------------------------
// Email transport. The VPS runs iRedMail (mail.julex.shop) — send through
// its local SMTP. Falls back to console logging when SMTP is unreachable so
// development/testing still shows the OTP.
// ----------------------------------------------------
let cachedTransport = null;
let lastFailLog = 0;

const transport = () => {
  if (cachedTransport) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    ignoreTLS: process.env.SMTP_IGNORE_TLS !== 'false',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined,
    connectionTimeout: 8000
  });
  return cachedTransport;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || 'Go Julex <no-reply@go.julex.shop>';
  try {
    const info = await transport().sendMail({ from, to, subject, text, html });
    return { sent: true, messageId: info?.messageId };
  } catch (e) {
    // Never break signup because mail failed — log (throttled) and surface
    // a dev fallback so the flow stays testable.
    const now = Date.now();
    if (now - lastFailLog > 30000) {
      console.error('SMTP send failed:', e.message);
      lastFailLog = now;
    }
    return { sent: false, error: e.message };
  }
};

export const otpEmailHtml = (code, purpose) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #f3d9a4;border-radius:12px;overflow:hidden">
    <div style="background:#0F172A;padding:18px 24px">
      <span style="color:#D4A017;font-weight:800;font-size:16px">GO JULEX</span>
      <span style="color:#94a3b8;font-size:11px;margin-left:8px">0% Platform Fee D2C SaaS</span>
    </div>
    <div style="padding:24px;color:#0f172a">
      <h2 style="font-size:16px;margin:0 0 8px">Verify your email</h2>
      <p style="font-size:13px;color:#475569;margin:0 0 16px">${purpose || 'Use this code to verify your email address.'}</p>
      <div style="font-size:30px;font-weight:800;letter-spacing:8px;color:#9F1239;background:#fff5f5;border:1px solid #fbc7cb;border-radius:10px;padding:12px;text-align:center">${code}</div>
      <p style="font-size:11px;color:#94a3b8;margin:16px 0 0">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
    </div>
  </div>
`;
