const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;
  
  const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (hasSMTP) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: log emails directly to console for seamless developer experience
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
      buffer: true
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"AquaPure Mineral Water" <no-reply@aquapure.in>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!hasSMTP) {
    console.log("📧 ==== NODEMAILER DEV EMAIL TRIGGERED ====");
    console.log("To:", mailOptions.to);
    console.log("Subject:", mailOptions.subject);
    console.log("Email body:\n", mailOptions.html);
    console.log("📧 ========================================");
  }
  
  return info;
};

module.exports = sendEmail;
