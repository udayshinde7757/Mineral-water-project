const Enquiry = require("../models/Enquiry");
const Product = require("../models/Product");
const User = require("../models/User");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc    Submit a new contact or product enquiry
 * @route   POST /api/enquiries
 * @access  Public
 */
const submitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, productId, quantity, message } = req.body;

    // Validate request body
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields: Name, Email, Phone, and Message.",
      });
    }

    // Optional product validation
    let productDetails = null;
    let productObjId = null;
    if (productId && productId !== "") {
      try {
        productDetails = await Product.findById(productId);
        if (productDetails) {
          productObjId = productDetails._id;
        }
      } catch (err) {
        console.warn("Enquiry product ID invalid or not found:", productId);
      }
    }

    // Save to Database
    const enquiry = await Enquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      product: productObjId,
      quantity: quantity ? Number(quantity) : 1,
      message: message.trim(),
      status: "pending",
    });

    // Populate for email description if product exists
    const productName = productDetails ? `${productDetails.name} (${productDetails.size})` : "General Inquiry";
    const dateStr = new Date().toLocaleDateString("en-IN");
    const timeStr = new Date().toLocaleTimeString("en-IN");

    // Email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0A77B7; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">Thank you for contacting AquaPure!</h2>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to us. We have received your enquiry regarding our premium mineral water products. Our dedicated customer success team is reviewing your request and will get back to you within 24 business hours.</p>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
          <h4 style="margin: 0 0 10px 0; color: #0A77B7;">Your Enquiry Summary:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px;">Category:</td>
              <td style="padding: 6px 0;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Quantity:</td>
              <td style="padding: 6px 0;">${quantity || 1}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Message:</td>
              <td style="padding: 6px 0;">${message}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
          <p style="font-size: 13px; color: #718096; text-align: center;">Stay hydrated. Stay healthy.<br /><strong>AquaPure — Pure from Source to Bottle</strong></p>
        </div>
      </div>
    `;

    // Email to company owner
    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #333333; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; color: #00B8A9;">New Customer Enquiry Received</h2>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background-color: #f7fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7; width: 150px;">Customer Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Phone Number</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${phone}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Email Address</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Product Interest</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${productName}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Quantity Requested</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${quantity || 1}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Message / Note</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${message}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Date Submitted</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #edf2f7;">Time Submitted</td>
              <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">${timeStr}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:5173/admin'}" style="background-color: #00B8A9; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Open Admin Panel</a>
          </div>
        </div>
      </div>
    `;

    // Try sending emails, do not throw error to user if mail server fails
    try {
      await sendEmail({
        to: email,
        subject: "Thank you for contacting us — AquaPure",
        html: customerEmailHtml,
      });

      const ownerEmailAddress = process.env.COMPANY_EMAIL || "info@aquapure.in";
      await sendEmail({
        to: ownerEmailAddress,
        subject: `New Enquiry from ${name} — AquaPure`,
        html: ownerEmailHtml,
      });
    } catch (mailError) {
      console.error("Nodemailer Email System Error:", mailError.message);
      // Swallow email sending failure, save enquiry to DB anyway (requirement)
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Submit Enquiry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while submitting enquiry.",
    });
  }
};

/**
 * @desc    Get all enquiries with search, filter, and pagination (Admin only)
 * @route   GET /api/enquiries
 * @access  Private/Admin
 */
const getEnquiries = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by Status (pending / completed)
    if (status && status !== "All") {
      query.status = status;
    }

    // Filter by Search Keyword
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .populate("product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      enquiries,
    });
  } catch (error) {
    console.error("Get Enquiries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error fetching enquiries.",
    });
  }
};

/**
 * @desc    Mark an enquiry as completed (Admin only)
 * @route   PUT /api/enquiries/:id
 * @access  Private/Admin
 */
const completeEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    enquiry.status = "completed";
    await enquiry.save();

    return res.status(200).json({
      success: true,
      message: "Enquiry marked as completed successfully.",
      enquiry,
    });
  } catch (error) {
    console.error("Complete Enquiry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error updating enquiry.",
    });
  }
};

/**
 * @desc    Delete an enquiry (Admin only)
 * @route   DELETE /api/enquiries/:id
 * @access  Private/Admin
 */
const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Enquiry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error deleting enquiry.",
    });
  }
};

/**
 * @desc    Get dashboard metrics and stats (Admin only)
 * @route   GET /api/enquiries/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const pendingEnquiries = await Enquiry.countDocuments({ status: "pending" });
    const completedEnquiries = await Enquiry.countDocuments({ status: "completed" });
    
    const totalProducts = await Product.countDocuments();
    const totalGallery = await Gallery.countDocuments();
    const totalTestimonials = await Testimonial.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    // Recent enquiries
    const recentEnquiries = await Enquiry.find()
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(5);

    // Distribution by category
    const productStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        enquiries: {
          total: totalEnquiries,
          pending: pendingEnquiries,
          completed: completedEnquiries,
        },
        counts: {
          products: totalProducts,
          gallery: totalGallery,
          testimonials: totalTestimonials,
          users: totalUsers,
        },
        recentEnquiries,
        productStats,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error loading dashboard statistics.",
    });
  }
};

module.exports = {
  submitEnquiry,
  getEnquiries,
  completeEnquiry,
  deleteEnquiry,
  getDashboardStats,
};
