const { getSiteSettings } = require("../services/settingsService");

/**
 * @desc    Get public website settings (delivery, tax, business info)
 * @route   GET /api/settings
 * @access  Public
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const { public: publicSettings } = await getSiteSettings();
    return res.status(200).json({ success: true, settings: publicSettings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
