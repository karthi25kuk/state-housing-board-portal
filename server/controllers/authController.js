const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      district,
      password,
      confirmPassword,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !phone ||
      !district ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    // Check password
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    // Check Indian mobile number
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create applicant account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),

      // Applicant's registered residential district
      district: district.trim(),

      password: hashedPassword,
      role: "APPLICANT",
      housingStatus: "NOT_ALLOTTED",
      isActive: true,
    });

    res.status(201).json({
      message: "Account created successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        district: user.district,
        role: user.role,
        housingStatus: user.housingStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration.",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        district: user.district,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        housingStatus: user.housingStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login.",
    });
  }
};

module.exports = {
  register,
  login,
};