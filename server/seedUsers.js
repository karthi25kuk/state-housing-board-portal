const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // ==========================================
    // ADMIN
    // ==========================================

    const adminPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const existingAdmin = await User.findOne({
      email: "admin@shb.com",
    });

    if (!existingAdmin) {
      await User.create({
        name: "State Housing Board Admin",
        email: "admin@shb.com",
        phone: "9000000001",
        password: adminPassword,
        role: "ADMIN",
        district: null,
        housingStatus: "NOT_ALLOTTED",
        isActive: true,
      });

      console.log("Admin created");
    } else {
      console.log("Admin already exists");
    }

    // ==========================================
    // CHENNAI OFFICER
    // ==========================================

    const officerPassword = await bcrypt.hash(
      "Officer@123",
      10
    );

    const existingOfficer = await User.findOne({
      email: "chennai.ofc@shb.com",
    });

    if (!existingOfficer) {
      await User.create({
        name: "Chennai District Officer",
        email: "chennai.ofc@shb.com",
        phone: "9000000002",
        password: officerPassword,
        role: "OFFICER",
        district: "Chennai",
        housingStatus: "NOT_ALLOTTED",
        isActive: true,
      });

      console.log("Chennai officer created");
    } else {
      console.log("Chennai officer already exists");
    }

    console.log("User seeding completed.");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Seeding error:", error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

createUsers();