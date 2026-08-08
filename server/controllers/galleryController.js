const Gallery = require("../models/Gallery");

const defaultImages = [
  {
    title: "Protected Spring Aquifer Sourcing",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800",
    category: "Plant",
  },
  {
    title: "Multi-Stage Bottling Plant",
    imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800",
    category: "Plant",
  },
  {
    title: "Sanitized Cap Bottling Machinery",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800",
    category: "Plant",
  },
  {
    title: "Everyday 1L Pet Bottle Lineup",
    imageUrl: "https://images.unsplash.com/photo-1608885898957-a599fb1698d6?auto=format&fit=crop&q=80&w=800",
    category: "Products",
  },
  {
    title: "Eco-Friendly Glass Bottle Range",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
    category: "Products",
  },
  {
    title: " door-to-door delivery transit loading",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    category: "Delivery",
  },
  {
    title: "Premium Office Cooler Installation",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    category: "Events",
  },
  {
    title: "Annual Hydration Partnership Summit",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    category: "Events",
  },
];

/**
 * @desc    Get all gallery items with optional category filtering
 * @route   GET /api/gallery
 * @access  Public
 */
const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== "All") {
      query.category = category;
    }

    const items = await Gallery.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      gallery: items,
    });
  } catch (error) {
    console.error("Get Gallery Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error loading gallery.",
    });
  }
};

/**
 * @desc    Create a new gallery item (Admin only)
 * @route   POST /api/gallery
 * @access  Private/Admin
 */
const createGalleryItem = async (req, res) => {
  try {
    const { title, imageUrl, category } = req.body;

    if (!title || !imageUrl || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, imageUrl, category.",
      });
    }

    const item = await Gallery.create({
      title,
      imageUrl,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Gallery image added successfully.",
      galleryItem: item,
    });
  } catch (error) {
    console.error("Create Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error adding gallery image.",
    });
  }
};

/**
 * @desc    Update a gallery item (Admin only)
 * @route   PUT /api/gallery/:id
 * @access  Private/Admin
 */
const updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Gallery image updated successfully.",
      galleryItem: updatedItem,
    });
  } catch (error) {
    console.error("Update Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error updating gallery image.",
    });
  }
};

/**
 * @desc    Delete a gallery item (Admin only)
 * @route   DELETE /api/gallery/:id
 * @access  Private/Admin
 */
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error deleting gallery item.",
    });
  }
};

/**
 * @desc    Seed default gallery items
 * @route   POST /api/gallery/seed
 * @access  Public/Admin
 */
const seedGallery = async (req, res) => {
  try {
    await Gallery.deleteMany({});
    const items = await Gallery.insertMany(defaultImages);

    return res.status(201).json({
      success: true,
      message: "Gallery seeded successfully.",
      count: items.length,
      gallery: items,
    });
  } catch (error) {
    console.error("Seed Gallery Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error seeding gallery.",
    });
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  seedGallery,
  defaultImages,
};
