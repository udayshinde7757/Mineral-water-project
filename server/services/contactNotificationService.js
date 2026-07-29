const sendEmail = require("../utils/sendEmail");

/**
 * Sends contact-form notifications when enabled via env.
 */
async function notifyContactMessage(contact) {
  if (process.env.CONTACT_EMAIL_ENABLED !== "true") {
    console.log(
      "Contact email notifications disabled (CONTACT_EMAIL_ENABLED is not true)."
    );
    return;
  }

  const ownerEmail = process.env.COMPANY_EMAIL || "info@aquapure.in";

  const ownerHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0A77B7;">New Contact Form Message</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
    </div>
  `;

  console.log(`Sending owner notification email to ${ownerEmail}...`);
  await sendEmail({
    to: ownerEmail,
    subject: `Contact: ${contact.subject} — ${contact.name}`,
    html: ownerHtml,
  });
  console.log(`Owner notification email sent to ${ownerEmail}.`);

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0A77B7;">Thank you for contacting AquaPure</h2>
      <p>Hi ${contact.name},</p>
      <p>We received your message and will get back to you soon.</p>
    </div>
  `;

  console.log(`Sending customer confirmation email to ${contact.email}...`);
  await sendEmail({
    to: contact.email,
    subject: "We received your message — AquaPure",
    html: customerHtml,
  });
  console.log(`Customer confirmation email sent to ${contact.email}.`);
}

module.exports = { notifyContactMessage };
