const dotenv = require('dotenv');
dotenv.config();

// Set dummy Meta Cloud API credentials for testing network contact
process.env.WHATSAPP_PHONE_NUMBER_ID = '1000123456789';
process.env.WHATSAPP_ACCESS_TOKEN = 'EAAG_test_token_sample_12345';

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const {
  sendOrderPlacedMessage,
  sendOutForDeliveryMessage,
  sendOrderCompletedMessage,
} = require('./services/whatsappService');

async function testWhatsAppCloudApiContact() {
  console.log('====================================================');
  console.log('📱 TESTING DIRECT CONTACT TO META GRAPH API');
  console.log('====================================================\n');

  await connectDB();

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

  console.log('Dispatching order placed message (contacting Meta API at https://graph.facebook.com/v21.0/1000123456789/messages)...');
  const resPlaced = await sendOrderPlacedMessage(mockOrder);
  console.log('   Result:', JSON.stringify(resPlaced, null, 2));

  console.log('\nChecking NotificationLog in MongoDB...');
  const NotificationLog = require('./models/NotificationLog');
  const latestLog = await NotificationLog.findOne({ recipient: '919356212824' }).sort({ sentAt: -1 });
  console.log('   Latest Log Entry:', JSON.stringify({
    event: latestLog?.event,
    status: latestLog?.status,
    error: latestLog?.error,
    recipient: latestLog?.recipient,
    sentAt: latestLog?.sentAt
  }, null, 2));

  process.exit(0);
}

testWhatsAppCloudApiContact().catch(err => {
  console.error('WhatsApp Test Error:', err);
  process.exit(0);
});
