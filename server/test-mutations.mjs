const BASE = 'http://localhost:5000/api';

async function testMutations() {
  console.log('\n--- Starting Mutation & Edge Case Verification Tests ---');
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

  // Get Super Admin Token
  let superAdminToken = '';
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gojulex.com', password: 'admin123' })
  });
  const loginJson = await loginRes.json();
  superAdminToken = loginJson.token;

  // 1. Super Admin: Provision Tenant
  const testSubdomain = `test-store-${Date.now()}`;
  let createdTenantId = '';
  await check('POST /api/super-admin/tenants', async () => {
    const res = await fetch(`${BASE}/super-admin/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Automated Test Boutique',
        subdomain: testSubdomain,
        category: 'Fashion & Apparel',
        planTier: 'SIX_MONTH',
        ownerName: 'Test Owner',
        ownerEmail: `owner-${Date.now()}@test.com`,
        ownerPassword: 'password123'
      })
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) throw new Error(json.message || 'Tenant creation failed');
    createdTenantId = json.data.id;
  });

  // 2. Super Admin: Update Tenant Status
  await check('PATCH /api/super-admin/tenants/:id/status', async () => {
    const res = await fetch(`${BASE}/super-admin/tenants/${createdTenantId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ status: 'ACTIVE', planTier: 'ONE_YEAR' })
    });
    const json = await res.json();
    if (!json.success || json.data.planTier !== 'ONE_YEAR') throw new Error('Status update failed');
  });

  // 3. Super Admin: Send Broadcast
  await check('POST /api/super-admin/broadcast', async () => {
    const res = await fetch(`${BASE}/super-admin/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        title: 'Platform Maintenance Notice',
        message: 'Scheduled database optimization tonight at 2 AM IST.',
        targetTier: 'all'
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error('Broadcast dispatch failed');
  });

  // 4. Coupons: Validate Promo Code
  await check('POST /api/coupons/validate', async () => {
    const res = await fetch(`${BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'CHRONOS10', cartTotal: 50000 })
    });
    const json = await res.json();
    if (!json.success || json.data.calculatedDiscount !== 5000) throw new Error(json.message || 'Coupon validation failed');
  });

  // 5. Auth: Update Profile
  await check('PUT /api/auth/profile', async () => {
    const res = await fetch(`${BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ phone: '+91 99999 88888' })
    });
    const json = await res.json();
    if (!json.success || json.user.phone !== '+91 99999 88888') throw new Error('Profile update failed');
  });

  console.log(`\n--- Mutation Tests: ${passed} passed, ${failures} failed ---`);
  if (failures > 0) process.exit(1);
}

testMutations();
