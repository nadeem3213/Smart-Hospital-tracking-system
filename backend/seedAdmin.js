const Admin = require("./models/Admin");

async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ email: "admin@hospital.com" });
    if (existing) {
      console.log("Admin already exists, skipping seed.");
      return;
    }

    await Admin.create({
      email: "admin@hospital.com",
      password: "admin123",
    });

    console.log("Default admin seeded successfully.");
  } catch (err) {
    console.error("Error seeding admin:", err.message);
  }
}

module.exports = { seedAdmin };
