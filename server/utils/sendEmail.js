const nodemailer = require("nodemailer");

/**
 * Resolve SMTP settings from .env.
 * Supports SMTP_EMAIL/SMTP_PASSWORD (Gmail app password) and legacy SMTP_* names.
 */
function resolveSmtpConfig() {
  const user =
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    process.env.EMAIL_USER;

  const pass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  return {
    user,
    transporterOptions: {
      host,
      port,
      secure,
      auth: { user, pass },
      family: 4, // Force IPv4 connection to prevent ENETUNREACH on Render
      connectionTimeout: 12000,
      socketTimeout: 15000,
      greetingTimeout: 12000,
    },
  };
}

const sendEmail = async (options) => {
  const smtpConfig = resolveSmtpConfig();
  let transporter;

  if (smtpConfig) {
    transporter = nodemailer.createTransport(smtpConfig.transporterOptions);
  } else {
    console.warn(
      "sendEmail: SMTP credentials missing (SMTP_EMAIL/SMTP_USER + SMTP_PASSWORD/SMTP_PASS). Logging email to console instead."
    );
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
      buffer: true,
    });
  }

  const fromAddress =
    process.env.EMAIL_FROM ||
    (smtpConfig?.user
      ? `"AquaPure Mineral Water" <${smtpConfig.user}>`
      : '"AquaPure Mineral Water" <no-reply@aquapure.in>');

  const mailOptions = {
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (smtpConfig) {
      console.log(
        `Email sent successfully to ${mailOptions.to} (messageId: ${info.messageId})`
      );
    } else {
      console.log("==== NODEMAILER DEV EMAIL (not sent via SMTP) ====");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("Email body:\n", mailOptions.html);
      console.log("==================================================");
    }

    return info;
  } catch (error) {
    // Dual-path fallback: If Port 465 SSL times out or fails on Render, retry via Port 587 STARTTLS
    if (smtpConfig && (error.code === "ETIMEDOUT" || error.code === "ESOCKET" || error.code === "ECONNREFUSED")) {
      console.warn(`⚠️ Primary SMTP (Port ${smtpConfig.transporterOptions.port}) failed (${error.code}). Retrying via Port 587 STARTTLS fallback...`);
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: smtpConfig.transporterOptions.auth,
          family: 4,
          connectionTimeout: 12000,
          socketTimeout: 15000,
          greetingTimeout: 12000,
        });
        const info = await fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent via Port 587 fallback to ${mailOptions.to} (messageId: ${info.messageId})`);
        return info;
      } catch (fallbackError) {
        console.error("❌ Secondary SMTP Port 587 fallback also failed:", fallbackError.message);
      }
    }

    console.error("sendEmail failed:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      code: error.code,
      message: error.message,
      response: error.response,
    });
    throw error;
  }
};

module.exports = sendEmail;
module.exports.resolveSmtpConfig = resolveSmtpConfig;
