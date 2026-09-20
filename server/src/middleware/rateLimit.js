const attempts = new Map();

// Small single-process guard for public mutation endpoints. A shared store is
// needed if the API is later run with multiple replicas.
export const rateLimit = ({ windowMs, max }) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.baseUrl}`;
  const current = attempts.get(key);
  const bucket = current && current.expiresAt > now ? current : { count: 0, expiresAt: now + windowMs };
  bucket.count++;
  attempts.set(key, bucket);
  if (bucket.count > max) {
    res.set('Retry-After', String(Math.ceil((bucket.expiresAt - now) / 1000)));
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
  }
  if (attempts.size > 5000) {
    for (const [id, value] of attempts) if (value.expiresAt <= now) attempts.delete(id);
  }
  next();
};
