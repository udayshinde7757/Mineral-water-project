/**
 * Complete End-to-End Test Suite for AquaPure E-Commerce Application
 * Tests every major subsystem and reports exact results.
 */
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const results = [];
const issuesFound = [];
const fixesApplied = [];

function record(category, testName, passed, details = '') {
  results.push({ category, testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${category}] ${testName}${details ? ' — ' + details : ''}`);
  if (!passed) {
    issuesFound.push({ category, testName, details });
  }
}

async function api(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, data: null, error: err.message };
  }
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 AQUAPURE COMPLETE E2E TEST SUITE STARTING');
  console.log('====================================================\n');

  // 1. Health & Server Startup Check
  console.log('--- SECTION 1: SERVER & DATABASE HEALTH ---');
  const health = await api('GET', '/health');
  record('Startup', 'Server & Database Running', health.status === 200 && health.data?.db === 'CONNECTED', 
    `Server: ${health.data?.server}, DB: ${health.data?.db}`);

  // 2. Authentication System Test
  console.log('\n--- SECTION 2: CUSTOMER AUTHENTICATION ---');
  const testUser = {
    fullname: 'Test Customer',
    email: `customer_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  // 2a. Registration
  const regRes = await api('POST', '/auth/signup', testUser);
  record('Authentication', 'User Registration', regRes.status === 201 && regRes.data?.success, `Status ${regRes.status}`);
  const userToken = regRes.data?.token;

  // 2b. Duplicate Email Registration
  const dupRes = await api('POST', '/auth/signup', testUser);
  record('Authentication', 'Duplicate Email Rejection', dupRes.status === 400 && !dupRes.data?.success, `Status ${dupRes.status}`);

  // 2c. Login Correct Credentials
  const loginRes = await api('POST', '/auth/login', { email: testUser.email, password: testUser.password });
  record('Authentication', 'Login with Correct Credentials', loginRes.status === 200 && loginRes.data?.success && !!loginRes.data?.token, `Token acquired`);

  // 2d. Login Incorrect Credentials
  const badLoginRes = await api('POST', '/auth/login', { email: testUser.email, password: 'WrongPassword!' });
  record('Authentication', 'Login with Incorrect Credentials Rejection', badLoginRes.status === 401, `Status ${badLoginRes.status}`);

  // 2e. Password Leak Check in Profile
  const meRes = await api('GET', '/auth/me', null, userToken);
  const passwordExposed = meRes.data?.user?.password !== undefined;
  record('Authentication', 'Profile Check (No Password Exposed)', meRes.status === 200 && !passwordExposed, `Password in response: ${passwordExposed}`);

  // 2f. Unauthorized Access Check
  const unauthRes = await api('GET', '/auth/me', null, null);
  record('Authentication', 'Protected Route Access Rejection', unauthRes.status === 401, `Status ${unauthRes.status}`);

  // 3. Products Subsystem Test
  console.log('\n--- SECTION 3: PRODUCTS ---');
  const productsRes = await api('GET', '/products');
  const products = productsRes.data?.products || [];
  record('Products', 'Product Listing', productsRes.status === 200 && Array.isArray(products) && products.length > 0, `${products.length} products found`);

  let sampleProduct = null;
  if (products.length > 0) {
    sampleProduct = products[0];
    const detailsRes = await api('GET', `/products/${sampleProduct._id}`);
    record('Products', 'Product Details Fetch', detailsRes.status === 200 && detailsRes.data?.product?.name === sampleProduct.name, `Product: ${sampleProduct.name}`);
    
    // Check product fields
    const p = detailsRes.data?.product || {};
    const validFields = p._id && p.name && p.price !== undefined && p.stock !== undefined && p.image;
    record('Products', 'Product Fields Integrity (price, stock, image)', !!validFields, `Price: ${p.price}, Stock: ${p.stock}`);
  }

  // 4. Cart Subsystem Test
  console.log('\n--- SECTION 4: CART FLOW ---');
  if (sampleProduct) {
    // Add product
    const addCartRes = await api('POST', '/cart/add', { productId: sampleProduct._id }, userToken);
    record('Cart', 'Add Product to Cart', addCartRes.status === 200 && addCartRes.data?.success, `Cart count: ${addCartRes.data?.cart?.length}`);

    // Update quantity
    const updateCartRes = await api('PUT', '/cart/update', { productId: sampleProduct._id, quantity: 3 }, userToken);
    const updatedQty = updateCartRes.data?.cart?.find(i => String(i.productId?._id || i.productId) === String(sampleProduct._id))?.quantity;
    record('Cart', 'Update Cart Quantity', updateCartRes.status === 200 && updatedQty === 3, `New Quantity: ${updatedQty}`);

    // Add second product if available
    if (products.length > 1) {
      await api('POST', '/cart/add', { productId: products[1]._id }, userToken);
    }

    // Get Cart
    const getCartRes = await api('GET', '/cart', null, userToken);
    record('Cart', 'Fetch User Cart', getCartRes.status === 200 && getCartRes.data?.cart?.length > 0, `Items in cart: ${getCartRes.data?.cart?.length}`);

    // Remove product
    const removeRes = await api('DELETE', `/cart/remove/${sampleProduct._id}`, null, userToken);
    record('Cart', 'Remove Item from Cart', removeRes.status === 200, `Remaining: ${removeRes.data?.cart?.length}`);

    // Clear Cart
    const clearRes = await api('DELETE', '/cart/clear', null, userToken);
    record('Cart', 'Empty Cart', clearRes.status === 200 && clearRes.data?.cart?.length === 0, `Cart cleared`);
  }

  // 5. Buy Now & Checkout & COD Order Creation Test
  console.log('\n--- SECTION 5: BUY NOW & CHECKOUT & COD ORDER ---');
  if (sampleProduct) {
    // Add item to cart first so we can test Buy Now independence
    await api('POST', '/cart/add', { productId: sampleProduct._id }, userToken);

    const buyNowProduct = products.length > 1 ? products[1] : sampleProduct;
    const shippingAddress = {
      fullName: 'Test Customer',
      email: testUser.email,
      phone: '9356212824',
      addressLine1: '123 Test Street, Green Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    };

    // Place a BUY_NOW order
    const buyNowOrderPayload = {
      products: [{ productId: buyNowProduct._id, quantity: 2 }],
      shippingAddress,
      paymentMethod: 'COD',
      orderType: 'BUY_NOW',
    };

    const codRes = await api('POST', '/orders', buyNowOrderPayload, userToken);
    record('Buy Now & Orders', 'Create BUY_NOW COD Order', codRes.status === 201 && codRes.data?.success, `Order ID: ${codRes.data?.order?._id}`);
    const createdOrderId = codRes.data?.order?._id;

    // Verify Cart was NOT cleared by Buy Now order!
    const cartAfterBuyNow = await api('GET', '/cart', null, userToken);
    const cartPreserved = cartAfterBuyNow.data?.cart?.length > 0;
    record('Buy Now', 'Buy Now Independence (Cart Preserved)', cartPreserved, `Cart items remaining: ${cartAfterBuyNow.data?.cart?.length}`);

    // Clear cart for clean state
    await api('DELETE', '/cart/clear', null, userToken);
  }

  // 6. Razorpay Payment & Verification Test (TEST Mode)
  console.log('\n--- SECTION 6: RAZORPAY PAYMENT FLOW (TEST MODE) ---');
  if (sampleProduct) {
    // 6a. Create Razorpay order
    const rzpOrderRes = await api('POST', '/payment/create-order', {
      products: [{ productId: sampleProduct._id, quantity: 1 }],
    }, userToken);

    record('Razorpay', 'Create Razorpay Order (API)', rzpOrderRes.status === 200 && rzpOrderRes.data?.success && !!rzpOrderRes.data?.order?.id, 
      `Razorpay Order ID: ${rzpOrderRes.data?.order?.id}`);

    const rzpOrderId = rzpOrderRes.data?.order?.id;

    // 6b. Test Payment Verification with Invalid Signature (Should Fail)
    const invalidVerify = await api('POST', '/payment/verify', {
      razorpay_order_id: rzpOrderId || 'order_fake123',
      razorpay_payment_id: 'pay_fake123',
      razorpay_signature: 'invalid_signature_hash',
      products: [{ productId: sampleProduct._id, quantity: 1 }],
      shippingAddress: {
        fullName: 'Test Customer',
        email: testUser.email,
        phone: '9356212824',
        addressLine1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      paymentMethod: 'Razorpay / Online',
      orderType: 'CART',
    }, userToken);

    record('Razorpay', 'Invalid Signature Rejection (Failed Payment Guard)', invalidVerify.status === 400 && !invalidVerify.data?.success, 
      `Status ${invalidVerify.status}: ${invalidVerify.data?.message}`);

    // 6c. Test Payment Verification with Valid HMAC Signature
    if (rzpOrderId) {
      const crypto = require('crypto');
      const fakePaymentId = `pay_test_${Date.now()}`;
      const secret = process.env.RAZORPAY_KEY_SECRET || 'QhVV1OinbgBj4haYeTbmpTPb';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${rzpOrderId}|${fakePaymentId}`)
        .digest('hex');

      const validVerify = await api('POST', '/payment/verify', {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: signature,
        products: [{ productId: sampleProduct._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Test Customer',
          email: testUser.email,
          phone: '9356212824',
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        paymentMethod: 'Razorpay / Online',
        orderType: 'CART',
      }, userToken);

      record('Razorpay', 'Successful Payment Signature Verification & Order Creation', validVerify.status === 201 && validVerify.data?.success, 
        `Paid Order ID: ${validVerify.data?.order?._id}`);
    }
  }

  // 7. Customer Order History & Isolation Test
  console.log('\n--- SECTION 7: ORDER HISTORY & ISOLATION ---');
  const myOrdersRes = await api('GET', '/orders', null, userToken);
  record('Order History', 'Fetch My Orders', myOrdersRes.status === 200 && Array.isArray(myOrdersRes.data?.orders), `${myOrdersRes.data?.orders?.length} orders found`);

  // Create User B to test Order Isolation
  const userB = {
    fullname: 'User B',
    email: `userb_${Date.now()}@example.com`,
    password: 'UserBPassword123!',
  };
  const regUserB = await api('POST', '/auth/signup', userB);
  const tokenUserB = regUserB.data?.token;

  if (myOrdersRes.data?.orders?.length > 0 && tokenUserB) {
    const userAOrderId = myOrdersRes.data.orders[0]._id;
    const forbiddenRes = await api('GET', `/orders/${userAOrderId}`, null, tokenUserB);
    record('Security', 'Order Isolation (User B cannot view User A order)', forbiddenRes.status === 403, `Status: ${forbiddenRes.status}`);
  }

  // 8. Contact & Enquiry Subsystem Test
  console.log('\n--- SECTION 8: CONTACT & ENQUIRY ---');
  const contactPayload = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '9876543210',
    subject: 'Bulk Mineral Water Purchase',
    message: 'Hello, I would like to inquire about bulk ordering 500 bottles.',
  };
  const contactRes = await api('POST', '/contact', contactPayload);
  record('Contact/Enquiry', 'Submit Contact Form', contactRes.status === 201 && contactRes.data?.success, `ID: ${contactRes.data?.contact?.id}`);

  const badContactRes = await api('POST', '/contact', { name: 'Bad', email: 'invalid-email' });
  record('Contact/Enquiry', 'Validation Rejection for Invalid Form', badContactRes.status === 400, `Status: ${badContactRes.status}`);

  // 9. Admin Authentication & Protection Test
  console.log('\n--- SECTION 9: ADMIN AUTH & AUTHORIZATION ---');
  const adminLoginRes = await api('POST', '/admin/login', {
    email: 'admin@aquapure.com',
    password: 'Admin@123456',
  });
  record('Admin Auth', 'Admin Login with Valid Credentials', adminLoginRes.status === 200 && !!adminLoginRes.data?.token, `Admin Token Acquired`);
  const adminToken = adminLoginRes.data?.token;

  // Non-admin blocked from admin endpoints
  const userAdminAccess = await api('GET', '/admin/stats', null, userToken);
  record('Admin Auth', 'Normal User Blocked from Admin Endpoint', userAdminAccess.status === 403, `Status: ${userAdminAccess.status}`);

  // 10. Admin Dashboard & Order Workflow & Settings Test
  console.log('\n--- SECTION 10: ADMIN DASHBOARD & WORKFLOW ---');
  if (adminToken) {
    // Stats
    const statsRes = await api('GET', '/admin/stats', null, adminToken);
    record('Admin Dashboard', 'Fetch Dashboard Statistics', statsRes.status === 200 && statsRes.data?.success, `Total Orders: ${statsRes.data?.stats?.totalOrders}`);

    // Admin List Orders
    const adminOrdersRes = await api('GET', '/admin/orders', null, adminToken);
    record('Admin Dashboard', 'View All Orders', adminOrdersRes.status === 200, `Orders count: ${adminOrdersRes.data?.orders?.length}`);

    // Order Status Workflow Update
    if (myOrdersRes.data?.orders?.length > 0) {
      const orderToUpdate = myOrdersRes.data.orders[0]._id;

      // Status -> Processing
      const procRes = await api('PATCH', `/admin/orders/${orderToUpdate}/status`, { status: 'Processing', notes: 'Processing water bottles' }, adminToken);
      record('Order Status', 'Order Status → Processing', procRes.status === 200 && procRes.data?.order?.orderStatus === 'Processing', `Status: ${procRes.data?.order?.orderStatus}`);

      // Status -> Out For Delivery
      const outRes = await api('PATCH', `/admin/orders/${orderToUpdate}/status`, { status: 'Out For Delivery', notes: 'Driver en route' }, adminToken);
      record('Order Status', 'Order Status → Out For Delivery', outRes.status === 200 && outRes.data?.order?.orderStatus === 'Out For Delivery', `Status: ${outRes.data?.order?.orderStatus}`);

      // Status -> Delivered
      const delivRes = await api('PATCH', `/admin/orders/${orderToUpdate}/status`, { status: 'Delivered', notes: 'Handed to customer' }, adminToken);
      record('Order Status', 'Order Status → Delivered', delivRes.status === 200 && delivRes.data?.order?.orderStatus === 'Delivered', `Status: ${delivRes.data?.order?.orderStatus}`);
    }

    // Admin Settings Check
    const settingsRes = await api('GET', '/admin/settings', null, adminToken);
    record('Admin Settings', 'Get Site Settings', settingsRes.status === 200, `Delivery Charge: ${settingsRes.data?.settings?.deliveryCharges}`);
  }

  // 11. WhatsApp Notification Integration Check
  console.log('\n--- SECTION 11: WHATSAPP NOTIFICATION INTEGRATION ---');
  // Check NotificationLog collection in DB
  const notifLogsRes = await api('GET', '/admin/notifications', null, adminToken);
  record('WhatsApp', 'Notification Logs Accessibility', notifLogsRes.status === 200, `Total logs: ${notifLogsRes.data?.notifications?.length || notifLogsRes.data?.total || 0}`);

  console.log('\n====================================================');
  console.log('📊 TEST SUMMARY & RESULTS');
  console.log('====================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Features/Tests Executed: ${total}`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);

  return { total, passed, failed, results, issuesFound };
}

runE2ETests().then(res => {
  process.exit(res.failed === 0 ? 0 : 1);
}).catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
