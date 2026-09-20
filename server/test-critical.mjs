// Run only against a disposable, seeded test database and a locally running API.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.TEST_API_BASE || 'http://localhost:5000/api';
const suffix = randomUUID().slice(0, 8);
const call = async (method, path, body, token) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  return { status: response.status, body: await response.json() };
};

const login = async (email, password) => {
  const result = await call('POST', '/auth/login', { email, password });
  assert.equal(result.status, 200, result.body.message);
  return result.body;
};

const admin = await login('admin@gojulex.com', 'admin123');
const merchant = await login('merchant@gojulex.com', 'admin123');
const tenantId = merchant.user.tenantId;
assert.ok(tenantId);
const ownerEmail = `test-${suffix}@example.test`;
const provisioned = await call('POST', '/super-admin/tenants', {
  name: `Isolation Test ${suffix}`, subdomain: `isolation-${suffix}`,
  category: 'General', planTier: 'SIX_MONTH',
  ownerName: 'Isolation Owner', ownerEmail, ownerPassword: 'temporary-test-password'
}, admin.token);
assert.equal(provisioned.status, 201, provisioned.body.message);
const other = await login(ownerEmail, 'temporary-test-password');

const product = await call('POST', '/products', {
  name: `Validation Product ${suffix}`, brand: 'Validation', category: 'General',
  sellingPriceINR: 100, stockQuantity: 2, sku: `TEST-${suffix}`, tenantId
}, merchant.token);
assert.equal(product.status, 201, product.body.message);
const productId = product.body.data.id;
assert.equal((await call('PUT', `/products/${productId}`, { name: 'Stolen' }, other.token)).status, 403);

const key = randomUUID();
const payload = {
  checkoutKey: key, tenantId, customerName: 'Test Buyer', customerEmail: `buyer-${suffix}@example.test`,
  customerPhone: '9876543210', paymentMethod: 'Cash on Delivery', paymentStatus: 'PAID',
  discountAmount: 9999, totalAmount: 1, items: [{ id: productId, quantity: 1, finalPrice: 1 }],
  shippingAddress: { street: '1 Test Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }
};
const order = await call('POST', '/orders', payload);
assert.equal(order.status, 201, order.body.message);
assert.equal(order.body.data.totalAmount, 100);
assert.equal(order.body.data.paymentStatus, 'PENDING');
assert.equal((await call('GET', `/orders/${order.body.data.orderNumber}`)).status, 401);
assert.equal((await call('GET', `/orders/${order.body.data.orderNumber}`, undefined, other.token)).status, 403);
assert.equal((await call('GET', `/orders?tenantId=${tenantId}`, undefined, other.token)).status, 403);
const retry = await call('POST', '/orders', payload);
assert.equal(retry.status, 200);
assert.equal(retry.body.data.orderNumber, order.body.data.orderNumber);
assert.equal((await call('GET', `/products/${productId}`)).body.data.stock, 1);
const noStock = await call('POST', '/orders', { ...payload, checkoutKey: randomUUID(), items: [{ id: productId, quantity: 2 }] });
assert.equal(noStock.status, 409);
assert.equal((await call('GET', `/products/${productId}`)).body.data.stock, 1);
const cancelled = await call('PATCH', `/orders/${order.body.data.orderNumber}/status`, { status: 'CANCELLED' }, merchant.token);
assert.equal(cancelled.status, 200, cancelled.body.message);
assert.equal((await call('GET', `/products/${productId}`)).body.data.stock, 2);
await call('PATCH', `/orders/${order.body.data.orderNumber}/status`, { status: 'CANCELLED' }, merchant.token);
assert.equal((await call('GET', `/products/${productId}`)).body.data.stock, 2);
const codOrder = await call('POST', '/orders', { ...payload, checkoutKey: randomUUID() });
assert.equal(codOrder.status, 201, codOrder.body.message);
const codId = codOrder.body.data.orderNumber;
assert.equal((await call('PATCH', `/orders/${codId}/collect-cod`, undefined, merchant.token)).status, 409);
assert.equal((await call('PATCH', `/orders/${codId}/status`, { status: 'DELIVERED' }, merchant.token)).status, 200);
assert.equal((await call('PATCH', `/orders/${codId}/collect-cod`, undefined, other.token)).status, 403);
const paid = await call('PATCH', `/orders/${codId}/collect-cod`, undefined, merchant.token);
assert.equal(paid.status, 200, paid.body.message);
assert.equal(paid.body.data.paymentStatus, 'PAID');
assert.equal((await call('PATCH', `/orders/${codId}/collect-cod`, undefined, merchant.token)).status, 409);
assert.equal((await call('PATCH', `/orders/${codId}/status`, { status: 'CANCELLED' }, merchant.token)).status, 409);
const merchantKpis = await call('GET', '/admin/kpis', undefined, merchant.token);
const otherKpis = await call('GET', '/admin/kpis', undefined, other.token);
assert.equal(merchantKpis.status, 200);
assert.equal(otherKpis.status, 200);
assert.equal(merchantKpis.body.data.totalRevenue, 100);
assert.equal(otherKpis.body.data.totalRevenue, 0);
assert.equal(otherKpis.body.data.totalCustomersCount, 0);
const otherAnalytics = await call('GET', '/admin/analytics', undefined, other.token);
assert.equal(otherAnalytics.status, 200, otherAnalytics.body.message);
assert.equal(otherAnalytics.body.data.topProducts.length, 0);
console.log('Critical isolation, checkout, retry, and stock checks passed.');
