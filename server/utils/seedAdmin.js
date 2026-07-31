const User = require("../models/User");

/**
 * Ensures at least one admin user exists in DB & ensures existing users have default role.
 */
async function seedAdminUser() {
  try {
    // Backward compatibility: Set role="user" for any existing documents missing the role field
    await User.updateMany(
      { $or: [{ role: { $exists: false } }, { role: null }, { role: { $nin: ["user", "admin"] } }] },
      { $set: { role: "user" } }
    );

    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@aquapure.com";
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456";

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        fullname: "System Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        status: "active",
        phone: "+91 98765 43210",
      });
      await admin.save();
      console.log(`[Seed Admin] Initial Admin account created: ${adminEmail}`);
    } else if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
      console.log(`[Seed Admin] Account promoted to admin: ${adminEmail}`);
    }
  } catch (err) {
    console.error("[Seed Admin Error]", err.message);
  }
}

module.exports = seedAdminUser;

