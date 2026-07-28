const Testimonial = require("../models/Testimonial");

const defaultTestimonials = [
  {
    name: "Dr. Aditya Sen",
    role: "Health Consultant & MD",
    quote: "Hydration is key to gut health and longevity. I recommend AquaPure to my patients because of its balanced electrolyte configuration and guaranteed mineral retention during purification.",
    rating: 5,
  },
  {
    name: "Meera Nair",
    role: "Fitness Instructor",
    quote: "I carry the 500ml AquaPure bottle to all my fitness sessions. It tastes incredibly crisp, refreshingly pure, and keeps my hydration levels sustained without any metallic aftertaste.",
    rating: 5,
  },
  {
    name: "Vikram Malhotra",
    role: "Operations Manager, TechSoft",
    quote: "Our company shifted to AquaPure corporate delivery jars last year. Exceptional scheduled services, pristine container sanitation, and highly responsive support. Highly professional!",
    rating: 5,
  },
  {
    name: "Anjali Deshmukh",
    role: "Homemaker",
    quote: "As a mother, my priority is my family's wellness. AquaPure's multi-stage filtration and rigorous lab certification give me complete peace of mind that my children are drinking 100% safe water.",
    rating: 4,
  },
];

/**
 * @desc    Get all testimonials
 * @route   GET /api/testimonials
 * @access  Public
 */
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    console.error("Get Testimonials Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error loading testimonials.",
    });
  }
};

/**
 * @desc    Create a new testimonial (Admin only)
 * @route   POST /api/testimonials
 * @access  Private/Admin
 */
const createTestimonial = async (req, res) => {
  try {
    const { name, role, quote, rating } = req.body;

    if (!name || !quote) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and testimonial quote.",
      });
    }

    const testimonial = await Testimonial.create({
      name,
      role: role || "Customer",
      quote,
      rating: rating !== undefined ? Number(rating) : 5,
    });

    return res.status(201).json({
      success: true,
      message: "Testimonial review added successfully.",
      testimonial,
    });
  } catch (error) {
    console.error("Create Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error adding testimonial review.",
    });
  }
};

/**
 * @desc    Update a testimonial (Admin only)
 * @route   PUT /api/testimonials/:id
 * @access  Private/Admin
 */
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully.",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error("Update Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error updating testimonial.",
    });
  }
};

/**
 * @desc    Delete a testimonial (Admin only)
 * @route   DELETE /api/testimonials/:id
 * @access  Private/Admin
 */
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found.",
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error deleting testimonial.",
    });
  }
};

/**
 * @desc    Seed testimonials
 * @route   POST /api/testimonials/seed
 * @access  Public/Admin
 */
const seedTestimonials = async (req, res) => {
  try {
    await Testimonial.deleteMany({});
    const items = await Testimonial.insertMany(defaultTestimonials);

    return res.status(201).json({
      success: true,
      message: "Testimonials seeded successfully.",
      count: items.length,
      testimonials: items,
    });
  } catch (error) {
    console.error("Seed Testimonials Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error seeding testimonials.",
    });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  seedTestimonials,
  defaultTestimonials,
};
