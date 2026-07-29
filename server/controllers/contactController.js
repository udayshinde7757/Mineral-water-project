const Contact = require("../models/Contact");
const { notifyContactMessage } = require("../services/contactNotificationService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields: Name, Email, Phone, Subject, and Message.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number (at least 10 digits).",
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    try {
      await notifyContactMessage(contact);
    } catch (mailError) {
      console.error("Contact notification email error:", mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
      contact: {
        id: contact._id,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }
    console.error("Submit Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while submitting your message.",
    });
  }
};

/**
 * @desc    List all contact messages (admin panel ready)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
const getContacts = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    let query = {};
    if (search && search.trim()) {
      const term = search.trim();
      query = {
        $or: [
          { name: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
          { subject: { $regex: term, $options: "i" } },
          { message: { $regex: term, $options: "i" } },
        ],
      };
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-__v");

    return res.status(200).json({
      success: true,
      contacts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching contact messages.",
    });
  }
};

module.exports = {
  submitContact,
  getContacts,
};
