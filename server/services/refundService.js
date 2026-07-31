/**
 * Refund Service — Reusable online-payment refunds.
 *
 * Provider-agnostic: Razorpay is implemented today, Stripe is scaffolded so
 * it can be enabled later without touching the controllers.
 *
 * Order document fields written by this service:
 *   refundId, refundAmount, refundedAt, refundStatus, refundAttempts, refundErrorMessage
 */

const RAZORPAY = "razorpay";
const STRIPE = "stripe";

/**
 * Online payments are everything except Cash on Delivery.
 */
const isOnlinePayment = (paymentMethod) => {
  return paymentMethod !== "COD";
};

/**
 * A refund is possible only when real money was captured online.
 */
const isRefundable = (order) => {
  if (!order) return false;
  if (!isOnlinePayment(order.paymentMethod)) return false;
  return ["Paid", "Refunded"].includes(order.paymentStatus);
};

/**
 * Pick the gateway provider for an order.
 * Razorpay orders carry razorpayPaymentId; everything else online defaults to
 * Razorpay (the only configured gateway). Stripe is matched by method name.
 */
const detectProvider = (order) => {
  if (order.razorpayPaymentId || /razorpay/i.test(order.paymentMethod || "")) {
    return RAZORPAY;
  }
  if (/stripe/i.test(order.paymentMethod || "")) {
    return STRIPE;
  }
  return RAZORPAY;
};

const getRazorpayInstance = () => {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
  });
};

/**
 * Initiate a full refund via Razorpay for an order's captured payment.
 * Amount is in paise. Returns normalized refund info.
 */
const refundWithRazorpay = async (order) => {
  const razorpay = getRazorpayInstance();
  const paymentId = order.razorpayPaymentId;

  if (!paymentId) {
    throw new Error("Missing Razorpay payment ID — cannot process refund");
  }

  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(order.totalAmount * 100),
    notes: {
      orderId: order._id.toString(),
      reason: order.cancellationReason || "Customer requested cancellation",
    },
  });

  return {
    provider: RAZORPAY,
    refundId: refund.id,
    status: refund.status, // "pending" | "processed" | "failed"
    amount: (refund.amount || 0) / 100,
  };
};

/**
 * Stripe support scaffold — enable later by configuring STRIPE_SECRET_KEY.
 */
const refundWithStripe = async (order) => {
  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe refund requested but STRIPE_SECRET_KEY is not configured");
  }

  // const stripe = require("stripe")(STRIPE_SECRET_KEY);
  // const paymentIntentId = order.stripePaymentIntentId;
  // if (!paymentIntentId) throw new Error("Missing Stripe PaymentIntent ID");
  // const refund = await stripe.refunds.create({
  //   payment_intent: paymentIntentId,
  //   amount: Math.round(order.totalAmount * 100),
  //   metadata: { orderId: order._id.toString() },
  // });
  // return {
  //   provider: STRIPE,
  //   refundId: refund.id,
  //   status: refund.status, // "succeeded" | "pending" | "failed"
  //   amount: (refund.amount || 0) / 100,
  // };

  throw new Error("Stripe refund provider is not implemented yet");
};

/**
 * Initiate a refund for an order using the appropriate gateway.
 * @returns {Promise<{provider:string, refundId:string, status:string, amount:number}>}
 */
const initiateRefund = async (order) => {
  const provider = detectProvider(order);

  switch (provider) {
    case RAZORPAY:
      return refundWithRazorpay(order);
    case STRIPE:
      return refundWithStripe(order);
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
};

/**
 * Re-check the status of an already-initiated refund (used to complete
 * pending refunds once the gateway confirms them).
 */
const fetchRefundStatus = async (order) => {
  if (!order.refundId) {
    return { status: "none", refundId: null, amount: null };
  }

  const provider = detectProvider(order);

  if (provider === RAZORPAY) {
    const razorpay = getRazorpayInstance();
    const refund = await razorpay.refunds.fetch(order.refundId);
    return {
      provider: RAZORPAY,
      status: refund.status, // "pending" | "processed" | "failed"
      refundId: refund.id,
      amount: (refund.amount || 0) / 100,
    };
  }

  return { provider: STRIPE, status: "unknown", refundId: order.refundId, amount: order.refundAmount };
};

/**
 * Map a gateway refund status to our refundStatus enum.
 */
const mapRefundStatus = (gatewayStatus) => {
  if (gatewayStatus === "processed" || gatewayStatus === "succeeded") return "Completed";
  if (gatewayStatus === "failed") return "Failed";
  return "Initiated"; // pending / created / unknown → still in flight
};

module.exports = {
  RAZORPAY,
  STRIPE,
  isOnlinePayment,
  isRefundable,
  detectProvider,
  initiateRefund,
  fetchRefundStatus,
  mapRefundStatus,
};
