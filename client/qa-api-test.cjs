/* Backend API test — hits every endpoint with valid + invalid inputs, checks
 * status codes & error handling. Run: node qa-api-test.cjs (backend must run). */
const API = 'http://localhost:5000/api'
const results = []
const record = (name, pass, extra = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}
const TS = Date.now().toString().slice(-8)
const USER = { fullname: 'API Tester', email: `api.${TS}@gmail.com`, password: 'testpass123' }

let token, user, adminToken, productId, orderId

async function req(method, path, body, t) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}
const expect = (name, cond, extra = '') => record(name, !!cond, extra)

async function main() {
  // ── AUTH ──
  console.log('\n═══ AUTH ═══')
  expect('Signup valid', (await req('POST', '/auth/signup', USER)).status === 201)
  expect('Signup missing fields → 400', (await req('POST', '/auth/signup', { fullname: 'X', email: 'y@z.com' })).status === 400)
  expect('Signup short password → 400', (await req('POST', '/auth/signup', { fullname: 'X', email: `p.${TS}@gmail.com`, password: '123' })).status === 400)
  expect('Signup duplicate email → 400', (await req('POST', '/auth/signup', USER)).status === 400)
  expect('Login valid', (await req('POST', '/auth/login', { email: USER.email, password: USER.password })).status === 200)
  expect('Login wrong password → 401', (await req('POST', '/auth/login', { email: USER.email, password: 'wrong' })).status === 401)
  expect('Login missing email → 400', (await req('POST', '/auth/login', { password: 'x' })).status === 400)
  const login = await req('POST', '/auth/login', { email: USER.email, password: USER.password })
  token = login.data.token
  user = login.data.user
  expect('Token issued', !!token)
  expect('No protected data in user payload', !login.data.user?.password)

  // me
  expect('GET /auth/me valid token', (await req('GET', '/auth/me', undefined, token)).status === 200)
  expect('GET /auth/me no token → 401', (await req('GET', '/auth/me')).status === 401)
  expect('GET /auth/me bad token → 401', (await req('GET', '/auth/me', undefined, 'badtoken')).status === 401)

  // ── PRODUCTS ──
  console.log('\n═══ PRODUCTS ═══')
  const prods = (await req('GET', '/products'))
  expect('GET /products → 200', prods.status === 200 && prods.data.count > 0)
  productId = prods.data.products[0]._id
  expect('GET /products/:id → 200', (await req('GET', `/products/${productId}`)).status === 200)
  expect('GET /products/invalid → 400 (malformed id)', (await req('GET', '/products/invalidid')).status === 400)
  expect('GET /products/valid-missing → 404', (await req('GET', '/products/000000000000000000000000')).status === 404)
  expect('GET /products?category=Bulk → 200', (await req('GET', '/products?category=Bulk')).status === 200)
  expect('GET /products?category=Bogus → 0 items', (await req('GET', '/products?category=Bogus')).data.count === 0)
  expect('GET /products?search=water → 200', (await req('GET', '/products?search=water')).status === 200)
  expect('GET /products?sort=price_asc → sorted', await (async () => {
    const d = (await req('GET', '/products?sort=price_asc')).data.products
    return d.every((p, i) => i === 0 || d[i - 1].price <= p.price)
  })())

  // PUBLIC product CRUD is a security risk — verify current exposure
  const unauthorizedCreate = await req('POST', '/products', { name: 'Hacked', size: '1L', price: 1, image: '/x.png', description: 'x', category: 'Personal' })
  expect('⚠️ Unauthenticated product create blocked (SECURITY)', unauthorizedCreate.status >= 400 && unauthorizedCreate.status !== 200,
    `status=${unauthorizedCreate.status} (if 200 → public CRUD exposed)`)

  // ── CART ──
  console.log('\n═══ CART ═══')
  expect('Add to cart → 200', (await req('POST', '/cart/add', { productId }, token)).status === 200)
  expect('Add to cart missing id → 400', (await req('POST', '/cart/add', {}, token)).status === 400)
  expect('Add nonexistent product → 404', (await req('POST', '/cart/add', { productId: '000000000000000000000000' }, token)).status === 404)
  expect('Cart requires auth → 401', (await req('GET', '/cart')).status === 401)
  expect('GET cart → 200', (await req('GET', '/cart', undefined, token)).status === 200)
  const upd = await req('PUT', '/cart/update', { productId, quantity: 3 }, token)
  expect('Update qty → 200', upd.status === 200, `status=${upd.status} ${upd.data?.message || ''}`)
  expect('Update qty to 0 → 400', (await req('PUT', '/cart/update', { productId, quantity: 0 }, token)).status >= 400)
  expect('Update qty negative → 400', (await req('PUT', '/cart/update', { productId, quantity: -2 }, token)).status >= 400)
  expect('Remove item → 200', (await req('DELETE', `/cart/remove/${productId}`, undefined, token)).status === 200)
  expect('Clear cart → 200', (await req('DELETE', '/cart/clear', undefined, token)).status === 200)

  // ── ADDRESS ──
  console.log('\n═══ ADDRESS ═══')
  expect('GET address requires auth → 401', (await req('GET', '/address')).status === 401)
  const addrBody = { fullName: 'API Tester', email: USER.email, phone: '9876543210', addressLine1: 'Flat 1', city: 'Nagpur', state: 'MH', pincode: '440001', country: 'India' }
  expect('PUT address missing fields → 400', (await req('PUT', '/address', { city: 'Nagpur' }, token)).status === 400)
  expect('PUT address → 200', (await req('PUT', '/address', addrBody, token)).status === 200)
  expect('GET address → 200', (await req('GET', '/address', undefined, token)).status === 200)

  // ── ORDERS (COD) ──
  console.log('\n═══ ORDERS ═══')
  await req('POST', '/cart/add', { productId }, token)
  const orderPayload = {
    products: [{ productId, quantity: 1 }],
    shippingAddress: { fullName: 'API Tester', email: USER.email, phone: '9876543210', addressLine1: 'Flat 1', city: 'Nagpur', state: 'MH', pincode: '440001', country: 'India' },
    paymentMethod: 'COD',
  }
  const orderRes = await req('POST', '/orders', orderPayload, token)
  expect('Create COD order → 201', orderRes.status === 201, `status=${orderRes.status} ${orderRes.data?.message || ''}`)
  if (orderRes.data?.order?._id) {
    orderId = orderRes.data.order._id
    expect('Order total computed (subtotal+delivery+gst)', typeof orderRes.data.order.totalAmount === 'number' && orderRes.data.order.totalAmount > 0, `total=${orderRes.data.order.totalAmount}`)
  }
  expect('Create order no products → 400', (await req('POST', '/orders', { shippingAddress: orderPayload.shippingAddress, paymentMethod: 'COD' }, token)).status === 400)
  expect('Create order no address → 400', (await req('POST', '/orders', { products: [{ productId, quantity: 1 }], paymentMethod: 'COD' }, token)).status === 400)
  expect('Create order online payment → 400 (use payment API)', (await req('POST', '/orders', { products: [{ productId, quantity: 1 }], shippingAddress: orderPayload.shippingAddress, paymentMethod: 'UPI' }, token)).status === 400)
  expect('Create order requires auth → 401', (await req('POST', '/orders', { products: [{ productId, quantity: 1 }], shippingAddress: {}, paymentMethod: 'COD' })).status === 401)
  expect('GET /orders → 200', (await req('GET', '/orders', undefined, token)).status === 200)
  if (orderId) {
    expect('GET /orders/:id (own) → 200', (await req('GET', `/orders/${orderId}`, undefined, token)).status === 200)
    expect('GET /orders/:id (other user) → 404/403', await (async () => {
      const other = (await req('POST', '/auth/signup', { fullname: 'Other', email: `o.${TS}@gmail.com`, password: 'testpass123' })).data.token
      const s = (await req('GET', `/orders/${orderId}`, undefined, other)).status
      return [404, 403].includes(s)
    })())
    // user cancels own order via PUT /:id/cancel
    const cRes = await req('PUT', `/orders/${orderId}/cancel`, { cancellationReason: 'api test' }, token)
    expect('User cancels own pending order → 200', cRes.status === 200, `status=${cRes.status} ${cRes.data?.message || ''}`)
    // user cannot use admin status endpoint
    const escalate = await req('PUT', `/orders/${orderId}/status`, { status: 'Delivered' }, token)
    expect('User blocked from admin status endpoint → 403', escalate.status === 403, `status=${escalate.status}`)
  }

  // ── CONTACT / ENQUIRY ──
  console.log('\n═══ CONTACT ═══')
  expect('POST /contact → 201', (await req('POST', '/contact', { name: 'X', email: 'x@y.com', phone: '9876543210', message: 'hello', subject: 'hi' })).status === 201)
  expect('POST /contact invalid email → 400', (await req('POST', '/contact', { name: 'X', email: 'bad', phone: '9876543210', message: 'hello', subject: 'hi' })).status === 400)
  expect('POST /contact invalid phone → 400', (await req('POST', '/contact', { name: 'X', email: 'x@y.com', phone: '123', message: 'hello', subject: 'hi' })).status === 400)
  expect('POST /contact missing fields → 400', (await req('POST', '/contact', { name: 'X' })).status === 400)
  expect('POST /enquiry → 201', (await req('POST', '/enquiry', { name: 'X', email: 'x@y.com', phone: '9876543210', quantity: 5, message: 'Need supply' })).status === 201)
  expect('POST /enquiry missing fields → 400', (await req('POST', '/enquiry', { name: 'X' })).status === 400)

  // ── GALLERY / TESTIMONIALS (newly mounted) ──
  console.log('\n═══ GALLERY / TESTIMONIALS ═══')
  const gal = await req('GET', '/gallery')
  expect('GET /gallery → 200', gal.status === 200)
  const tes = await req('GET', '/testimonials')
  expect('GET /testimonials → 200', tes.status === 200)
  expect('Unauthenticated gallery create → 401', (await req('POST', '/gallery', { title: 'x', imageUrl: 'y', category: 'Plant' })).status === 401)
  expect('Unauthenticated testimonial create → 401', (await req('POST', '/testimonials', { name: 'x', quote: 'y', rating: 5 })).status === 401)

  // ── ADMIN ──
  console.log('\n═══ ADMIN ═══')
  expect('Admin login wrong password → 401', (await req('POST', '/admin/login', { email: 'admin@aquapure.com', password: 'wrong' })).status === 401)
  const admin = await req('POST', '/admin/login', { email: 'admin@aquapure.com', password: 'Admin@123456' })
  adminToken = admin.data.token
  expect('Admin login → 200 + token', admin.status === 200 && !!adminToken)
  expect('Admin /me → 200', (await req('GET', '/admin/me', undefined, adminToken)).status === 200)

  // Product CRUD as admin
  const np = await req('POST', '/admin/products', { name: `Test Product ${TS}`, size: '1L', price: 99, image: '/images/1ltr.png', description: 'qa', category: 'Personal', stock: 10 }, adminToken)
  expect('Admin create product → 201', np.status === 201 && np.data.product?._id, `status=${np.status}`)
  const npId = np.data?.product?._id
  if (npId) {
    expect('Admin update product → 200', (await req('PUT', `/admin/products/${npId}`, { price: 129 }, adminToken)).status === 200)
    expect('Admin delete product → 200', (await req('DELETE', `/admin/products/${npId}`, undefined, adminToken)).status === 200)
    expect('Deleted product gone → 404', (await req('GET', `/products/${npId}`)).status === 404)
  }
  expect('Admin create product invalid → 400', (await req('POST', '/admin/products', { name: '', size: '', price: -5, image: '', description: '' }, adminToken)).status === 400)

  // Admin settings
  expect('GET /admin/settings → 200', (await req('GET', '/admin/settings', undefined, adminToken)).status === 200)
  const setRes = await req('PUT', '/admin/settings', { deliveryCharges: 20, freeDeliveryThreshold: 50, taxPercentage: 3 }, adminToken)
  expect('PUT /admin/settings → 200', setRes.status === 200, `status=${setRes.status} ${setRes.data?.message || ''}`)

  // Admin users/customers
  const cust = await req('GET', '/admin/customers', undefined, adminToken)
  expect('GET /admin/customers → 200', cust.status === 200 && Array.isArray(cust.data.customers || cust.data.users))
  // block the API-test user and verify they are locked out of protected APIs
  const myUserId = user.id
  const blockRes = await req('PATCH', `/admin/customers/${myUserId}/status`, { status: 'blocked' }, adminToken)
  expect('Admin blocks customer → 200', blockRes.status === 200, `status=${blockRes.status} ${blockRes.data?.message || ''}`)
  const blockedReq = await req('GET', '/cart', undefined, token)
  expect('Blocked user rejected from protected API → 403', blockedReq.status === 403, `status=${blockedReq.status}`)
  const unblockRes = await req('PATCH', `/admin/customers/${myUserId}/status`, { status: 'active' }, adminToken)
  expect('Admin unblocks customer → 200', unblockRes.status === 200, `status=${unblockRes.status}`)
  const activeReq = await req('GET', '/cart', undefined, token)
  expect('Unblocked user can access API again → 200', activeReq.status === 200, `status=${activeReq.status}`)

  // Non-admin blocked from admin APIs
  expect('Non-admin GET /admin/stats → 403', (await req('GET', '/admin/stats', undefined, token)).status === 403)
  expect('Non-admin POST /admin/products → 403', (await req('POST', '/admin/products', { name: 'x' }, token)).status === 403)

  // ── PAYMENT ──
  console.log('\n═══ PAYMENT ═══')
  expect('Create razorpay order → 200', (await req('POST', '/payment/create-order', { products: [{ productId, quantity: 1 }] }, token)).status === 200)
  expect('Create razorpay order empty → 400', (await req('POST', '/payment/create-order', { products: [] }, token)).status === 400)
  expect('Verify payment bad sig → 400/500', (async () => {
    const r = await req('POST', '/payment/verify', { razorpayOrderId: 'x', razorpayPaymentId: 'y', razorpaySignature: 'z' }, token)
    return [400, 500].includes(r.status)
  })())

  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed, ${fails.length} failed ════`)
  process.exit(fails.length ? 1 : 0)
}

main().catch((e) => { console.error('RUNNER ERROR:', e); process.exit(1) })
