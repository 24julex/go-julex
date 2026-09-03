const BASE = 'http://localhost:5000/api';

async function testBackend() {
  console.log('--- Starting Backend Verification Tests ---');
  let failures = 0;
  let passed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failures++;
    }
  }

  // 1. Health Check
  await check('GET /api/health', async () => {
    const res = await fetch(`${BASE}/health`);
    const json = await res.json();
    if (json.status !== 'healthy') throw new Error('Health status unexpected');
  });

  // 2. Auth Login (Super Admin)
  let superAdminToken = '';
  await check('POST /api/auth/login (Super Admin)', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gojulex.com', password: 'admin123' })
    });
    const json = await res.json();
    if (!json.success || !json.token) throw new Error(json.message || 'Login failed');
    superAdminToken = json.token;
  });

  // 3. Auth Login (Merchant Owner)
  let merchantToken = '';
  await check('POST /api/auth/login (Merchant Owner)', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'merchant@gojulex.com', password: 'admin123' })
    });
    const json = await res.json();
    if (!json.success || !json.token) throw new Error(json.message || 'Login failed');
    merchantToken = json.token;
  });

  // 4. Auth /me
  await check('GET /api/auth/me', async () => {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || json.user.role !== 'SUPER_ADMIN') throw new Error('Auth me failed');
  });

  // 5. Auth /users
  await check('GET /api/auth/users', async () => {
    const res = await fetch(`${BASE}/auth/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('List users failed');
  });

  // 6. Products GET
  await check('GET /api/products', async () => {
    const res = await fetch(`${BASE}/products`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Products list failed');
  });

  // 7. Brands GET
  await check('GET /api/brands', async () => {
    const res = await fetch(`${BASE}/brands?details=true`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Brands list failed');
  });

  // 8. Orders GET
  await check('GET /api/orders', async () => {
    const res = await fetch(`${BASE}/orders`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Orders list failed');
  });

  // 9. Admin KPIs
  await check('GET /api/admin/kpis', async () => {
    const res = await fetch(`${BASE}/admin/kpis`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const json = await res.json();
    if (!json.success || json.data.totalOrdersCount === undefined) throw new Error('KPIs calculation failed');
  });

  // 10. Admin Analytics
  await check('GET /api/admin/analytics', async () => {
    const res = await fetch(`${BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.salesByDay)) throw new Error('Analytics failed');
  });

  // 11. Coupons GET
  await check('GET /api/coupons', async () => {
    const res = await fetch(`${BASE}/coupons`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Coupons list failed');
  });

  // 12. Super Admin Tenants
  await check('GET /api/super-admin/tenants', async () => {
    const res = await fetch(`${BASE}/super-admin/tenants`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Super admin tenants failed');
  });

  // 13. Super Admin Platform Metrics
  await check('GET /api/super-admin/metrics', async () => {
    const res = await fetch(`${BASE}/super-admin/metrics`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || json.data.totalStores === undefined) throw new Error('Super admin metrics failed');
  });

  // 14. Super Admin Audit Logs
  await check('GET /api/super-admin/audit-logs', async () => {
    const res = await fetch(`${BASE}/super-admin/audit-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Audit logs failed');
  });

  // 15. Customers GET
  await check('GET /api/customers', async () => {
    const res = await fetch(`${BASE}/customers`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Customers list failed');
  });

  // 16. Invoices Master Templates (Super Admin)
  await check('GET /api/super-admin/invoices', async () => {
    const res = await fetch(`${BASE}/super-admin/invoices`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invoices template list failed');
  });

  // 17. Merchant Invoice Config
  await check('GET /api/merchant/invoice-config', async () => {
    const res = await fetch(`${BASE}/merchant/invoice-config`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const json = await res.json();
    if (!json.success || !json.data.config) throw new Error('Merchant invoice config failed');
  });

  console.log(`\n--- Test Summary: ${passed} passed, ${failures} failed ---`);
  if (failures > 0) process.exit(1);
}

testBackend();
