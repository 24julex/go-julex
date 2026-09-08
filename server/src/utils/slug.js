// ----------------------------------------------------
// Go Julex subdomain slugs: {slug}.go.julex.shop
// Generated from the merchant's store name.
// ----------------------------------------------------
export const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'go', 'mail', 'management', 'store', 'shop',
  'super-admin', 'superadmin', 'dashboard', 'login', 'auth', 'cdn', 'static',
  'assets', 'support', 'help', 'blog', 'status', 'ns1', 'ns2', 'ftp', 'smtp', 'imap'
]);

// "RAM'S T-SHIRT STORE" -> "ramstshirt"
export const makeSlug = (name) => String(name || '')
  .toLowerCase()
  .replace(/[‘’']/g, '')      // apostrophes removed
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '')             // spaces/punctuation/hyphens removed
  .slice(0, 40);

export const validateSlug = (slug) => {
  if (!/^[a-z0-9]+$/.test(slug)) return 'Slug may contain only lowercase letters and numbers.';
  if (slug.length < 3) return 'Slug must be at least 3 characters.';
  if (slug.length > 40) return 'Slug must be at most 40 characters.';
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is a reserved name. Please choose another store name.`;
  return null;
};

const normSub = (v) => String(v || '').toLowerCase()
  .replace(/\.go\.julex\.shop$/, '')
  .replace(/\.go\.julex\.shop$/, '').replace(/\.gojulex\.com$/, '')
  .replace(/\.julex\.shop$/, '')
  .replace(/^store_/, '');

// Ensure {slug} is free across the platform; if taken, append a clean counter.
export const uniqueSlug = async (prisma, desired, { excludeTenantId = null } = {}) => {
  const err = validateSlug(desired);
  if (err) return { error: err };
  const all = await prisma.tenant.findMany({ select: { id: true, subdomain: true, subdomainAliases: true } });
  const taken = new Set();
  all.forEach((t) => {
    if (excludeTenantId && t.id === excludeTenantId) return;
    taken.add(normSub(t.subdomain));
    try {
      const aliases = t.subdomainAliases ? JSON.parse(t.subdomainAliases) : [];
      aliases.forEach((a) => taken.add(normSub(a)));
    } catch (e) {}
  });
  if (!taken.has(desired)) return { slug: desired };
  for (let i = 1; i < 500; i++) {
    const candidate = `${desired}${i}`.slice(0, 40);
    if (!taken.has(candidate)) return { slug: candidate };
  }
  return { error: 'Could not find a free variation of that name. Please choose another.' };
};

export { normSub };
