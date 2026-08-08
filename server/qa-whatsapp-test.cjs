const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const {
  sendOrderPlacedMessage,
  sendOutForDeliveryMessage,
  sendOrderCompletedMessage,
  sendOrderStatusWhatsApp,
} = require('./services/whatsappService');

async function testWhatsAppCloudApi() {
  console.log('====================================================');
  console.log('📱 TESTING META WHATSAPP CLOUD API INTEGRATION');
  console.log('====================================================\n');

  await connectDB();

  // Test Order object with user's test phone number +919356212824
  const mockOrder = {
    _id: new mongoose.Types.ObjectId(),
    shippingAddress: {
      fullName: 'Test Customer',
      phone: '+919356212824',
      addressLine1: '123 Water Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    totalAmount: 450,
    orderStatus: 'Placed',
    estimatedDelivery: new Date(Date.now() + 3 * 86400000),
  };

  console.log('1. Testing sendOrderPlacedMessage for phone +919356212824...');
  const resPlaced = await sendOrderPlacedMessage(mockOrder);
  console.log('   Result:', JSON.stringify(resPlaced, null, 2));

  console.log('\n2. Testing sendOutForDeliveryMessage for phone +919356212824...');
  const resOut = await sendOutForDeliveryMessage(mockOrder);
  console.log('   Result:', JSON.stringify(resOut, null, 2));

  console.log('\n3. Testing sendOrderCompletedMessage for phone +919356212824...');
  const resCompleted = await sendOrderCompletedMessage(mockOrder);
  console.log('   Result:', JSON.stringify(resCompleted, null, 2));

  console.log('\n4. Checking NotificationLog entries in MongoDB...');
  const NotificationLog = require('./models/NotificationLog');
  const logs = await NotificationLog.find({ recipient: '919356212824' }).sort({ sentAt: -1 }).limit(5);
  console.log(`   Found ${logs.length} notification log entries for 919356212824:`);
  logs.forEach(l => {
    console.log(`   - Event: ${l.event} | Status: ${l.status} | Error: ${l.error || 'None'}`);
  });

  process.exit(0);
}

testWhatsAppCloudApi().catch(err => {
  console.error('WhatsApp Test Error:', err);
  process.exit(1);
});
