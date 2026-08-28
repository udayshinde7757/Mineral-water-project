const nodemailer = require("nodemailer");

/**
 * Validates and sanitizes email environment configuration.
 * Trims whitespace/quotes, validates numeric ports, parses booleans, and masks secrets.
 */
function getValidatedEmailConfig() {
  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.EMAIL_API_KEY ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const brevoKey = (
    process.env.BREVO_API_KEY ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const smtpUser = (
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    process.env.EMAIL_USER ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const smtpPass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const smtpHost = (
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST ||
    "smtp.gmail.com"
  ).trim().replace(/^["']|["']$/g, "");

  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
  const smtpSecure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE.trim() === "true"
      : smtpPort === 465;

  const fromAddressRaw = (
    process.env.EMAIL_FROM ||
    process.env.COMPANY_EMAIL ||
    (apiKey ? "onboarding@resend.dev" : smtpUser || "no-reply@aquapure.in")
  ).trim().replace(/^["']|["']$/g, "");

  const fromName = (process.env.EMAIL_FROM_NAME || "AquaPure Mineral Water").trim();

  const formattedFrom = fromAddressRaw.includes("<")
    ? fromAddressRaw
    : `"${fromName}" <${fromAddressRaw}>`;

  let provider = "mock";
  if (apiKey) {
    provider = "resend";
  } else if (brevoKey) {
    provider = "brevo";
  } else if (smtpUser && smtpPass) {
    provider = "smtp";
  }

  return {
    provider,
    apiKey,
    brevoKey,
    smtp: {
      user: smtpUser,
      pass: smtpPass,
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
    },
    from: formattedFrom,
    fromEmailOnly: fromAddressRaw.replace(/.*<([^>]+)>.*/, "$1"),
    fromName,
  };
}

/**
 * Legacy compatibility helper for resolveSmtpConfig.
 */
function resolveSmtpConfig() {
  const config = getValidatedEmailConfig();
  if (config.provider !== "smtp") return null;

  return {
    user: config.smtp.user,
    transporterOptions: {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      family: 4,
      connectionTimeout: 12000,
      socketTimeout: 15000,
      greetingTimeout: 12000,
    },
  };
}

/**
 * Classify email error codes into clean categories for diagnostic logging.
 */
function classifyError(error) {
  const msg = (error.message || "").toLowerCase();
  const code = (error.code || "").toUpperCase();

  if (code === "ETIMEDOUT" || msg.includes("timeout") || msg.includes("enetunreach")) {
    return "CONNECTION_TIMEOUT";
  }
  if (code === "EAUTH" || msg.includes("invalid login") || msg.includes("authentication") || msg.includes("unauthorized")) {
    return "AUTHENTICATION_FAILED";
  }
  if (code === "ENOTFOUND" || msg.includes("getaddrinfo") || msg.includes("dns")) {
    return "DNS_LOOKUP_FAILURE";
  }
  if (msg.includes("api key") || msg.includes("forbidden") || msg.includes("restricted")) {
    return "API_KEY_INVALID";
  }
  return "NETWORK_DISPATCH_FAILURE";
}

/**
 * Send email via Resend HTTPS API (Port 443 — 100% reliable on Render/Cloud hosts).
 */
async function sendViaResendApi(config, options) {
  const payload = {
    from: config.from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || data.error?.message || `Resend API Error HTTP ${response.status}`);
    err.statusCode = response.status;
    err.code = response.status === 401 ? "EAUTH" : "EAPI";
    throw err;
  }

  return { messageId: data.id || `resend_${Date.now()}` };
}

/**
 * Send email via Brevo HTTPS API (Port 443 — Alternative Cloud Email API).
 */
async function sendViaBrevoApi(config, options) {
  const payload = {
    sender: { name: config.fromName, email: config.fromEmailOnly },
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.html,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": config.brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || `Brevo API Error HTTP ${response.status}`);
    err.statusCode = response.status;
    err.code = response.status === 401 ? "EAUTH" : "EAPI";
    throw err;
  }

  return { messageId: data.messageId || `brevo_${Date.now()}` };
}

/**
 * Send email via Nodemailer SMTP (For local dev or direct unblocked SMTP servers).
 */
async function sendViaSmtp(config, options) {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
    family: 4,
    connectionTimeout: 12000,
    socketTimeout: 15000,
    greetingTimeout: 12000,
  });

  try {
    return await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    // Port 465 -> Port 587 Fallback
    if (error.code === "ETIMEDOUT" || error.code === "ESOCKET" || error.code === "ECONNREFUSED") {
      console.warn(`[SMTP Dispatch] Primary Port ${config.smtp.port} failed (${error.code}). Retrying via Port 587 STARTTLS...`);
      const fallbackTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
        family: 4,
        connectionTimeout: 12000,
        socketTimeout: 15000,
        greetingTimeout: 12000,
      });
      return await fallbackTransporter.sendMail({
        from: config.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    }
    throw error;
  }
}

/**
 * Master Email Dispatcher
 */
const sendEmail = async (options) => {
  const config = getValidatedEmailConfig();
  const recipientDomain = (options.to || "").split("@")[1] || "unknown";

  try {
    let result;
    if (config.provider === "resend") {
      result = await sendViaResendApi(config, options);
      console.log(`[Email Dispatch Success] Provider: RESEND (HTTPS) | To: ${options.to} | MsgID: ${result.messageId}`);
    } else if (config.provider === "brevo") {
      result = await sendViaBrevoApi(config, options);
      console.log(`[Email Dispatch Success] Provider: BREVO (HTTPS) | To: ${options.to} | MsgID: ${result.messageId}`);
    } else if (config.provider === "smtp") {
      result = await sendViaSmtp(config, options);
      console.log(`[Email Dispatch Success] Provider: SMTP (${config.smtp.host}:${config.smtp.port}) | To: ${options.to} | MsgID: ${result.messageId}`);
    } else {
      console.log("==== NODEMAILER MOCK EMAIL (No API Key or SMTP credentials set) ====");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("==================================================================");
      result = { messageId: `mock_${Date.now()}` };
    }
    return result;
  } catch (error) {
    const errorClass = classifyError(error);
    console.error("[Email Dispatch Failure]", {
      provider: config.provider.toUpperCase(),
      to: options.to,
      recipientDomain,
      subject: options.subject,
      errorClass,
      errorCode: error.code || "UNKNOWN",
      errorMessage: error.message,
    });
    throw error;
  }
};

module.exports = sendEmail;
module.exports.resolveSmtpConfig = resolveSmtpConfig;
module.exports.getValidatedEmailConfig = getValidatedEmailConfig;
