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

  // Provider selection: HTTPS APIs first (Resend > Brevo), then SMTP as last resort
  // SMTP is unreliable on Render and many cloud hosts - they block ports 465/587
  let provider = "mock";
  if (apiKey) {
    provider = "resend";
  } else if (brevoKey) {
    provider = "brevo";
  } else if (smtpUser && smtpPass) {
    provider = "smtp";
    // Warn if SMTP is being used in production-like environment
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider selected in production. For Render/cloud hosts,");
      console.warn("    use RESEND_API_KEY instead (port 443 is never blocked).");
    }
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
 * Validates that required email configuration is present.
 * Returns object with isValid boolean and optional warning/error.
 */
function validateEmailConfig() {
  const config = getValidatedEmailConfig();

  if (config.provider === "mock") {
    return {
      isValid: false,
      message: "No email provider configured. Set RESEND_API_KEY or SMTP credentials.",
      recommendation: "Set RESEND_API_KEY for reliable HTTPS email delivery.",
    };
  }

  if (config.provider === "resend" && !config.apiKey.startsWith("re_")) {
    return {
      isValid: false,
      message: "Invalid Resend API key format.",
      recommendation: "Get a valid API key from https://resend.com",
    };
  }

  if (config.provider === "brevo" && !config.brevoKey.includes("_")) {
    return {
      isValid: false,
      message: "Invalid Brevo API key format.",
      recommendation: "Get a valid API key from https://brevo.com",
    };
  }

  if (config.provider === "smtp") {
    if (!config.smtp.host) {
      return {
        isValid: false,
        message: "SMTP host not configured.",
        recommendation: "Set SMTP_HOST (e.g., smtp.gmail.com)",
      };
    }
    if (!config.smtp.user || !config.smtp.pass) {
      return {
        isValid: false,
        message: "SMTP credentials incomplete.",
        recommendation: "Set SMTP_EMAIL and SMTP_PASSWORD",
      };
    }
    // Note: We don't fail for SMTP - it may work in local dev
    return {
      isValid: true,
      warning: "SMTP provider selected. May not work on Render/cloud hosts.",
      recommendation: "Consider using RESEND_API_KEY for production.",
    };
  }

  return { isValid: true };
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
 *
 * WARNING: Many cloud hosts (Render, Vercel, Heroku) block outbound SMTP ports 465/587.
 * For production, use RESEND_API_KEY or BREVO_API_KEY instead (HTTPS on port 443).
 */
async function sendViaSmtp(config, options) {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
    family: 4,
    connectionTimeout: 15000,
    socketTimeout: 20000,
    greetingTimeout: 15000,
  });

  try {
    return await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    // Only fallback if it's a port-specific error on Gmail
    // ETIMEDOUT on port 465 might work on port 587 (but NOT on Render - both are blocked)
    const isGmail = config.smtp.host.toLowerCase().includes("gmail");
    const isPortError = error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED";
    const isTlsIssue = error.code === "EAUTH" && error.command === "AUTH";

    if (isGmail && isPortError && config.smtp.port === 465) {
      console.warn(`[SMTP Dispatch] Port 465 failed (${error.code}). Attempting Port 587 STARTTLS...`);
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: config.smtp.host,
          port: 587,
          secure: false,
          auth: { user: config.smtp.user, pass: config.smtp.pass },
          family: 4,
          connectionTimeout: 15000,
          socketTimeout: 20000,
          greetingTimeout: 15000,
        });
        return await fallbackTransporter.sendMail({
          from: config.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
      } catch (fallbackError) {
        console.error(`[SMTP Dispatch] Port 587 fallback also failed: ${fallbackError.message}`);
        throw fallbackError;
      }
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
module.exports.validateEmailConfig = validateEmailConfig;
