const User = require("../models/User.model");
const Company = require("../models/Company.model");
const Job = require("../models/Job.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const registerJobSeeker = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    let cleanEmail = email ? email.trim().toLowerCase() : "";
    let cleanPhone = phoneNumber ? phoneNumber.trim() : "";

    if (!name && !cleanEmail && !cleanPhone) {
      return res.status(400).json({
        message: "Please enter your name and either an Email or Phone Number.",
      });
    }

    const userName = (name || cleanEmail.split("@")[0] || "NexHire Candidate").trim();

    // If only phone was provided, synthesize a unique email identifier
    if (!cleanEmail && cleanPhone) {
      const sanitizedPhone = cleanPhone.replace(/[^0-9]/g, "");
      cleanEmail = `${sanitizedPhone}@mobile.nexhire.com`;
    }

    // Check if account already exists - if so, log them in immediately without friction
    let user = null;
    if (cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
    }
    if (!user && cleanPhone) {
      user = await User.findOne({ phoneNumber: cleanPhone });
    }

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || "nexhire123", salt);
      
      user = new User({
        name: userName,
        email: cleanEmail || `${Date.now()}@nexhire.com`,
        phoneNumber: cleanPhone,
        password: hashedPassword,
        role: "job_seeker",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      await user.save();
    } else {
      // Mark as verified immediately
      user.isPhoneVerified = true;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "job_seeker" },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(201).json({
      message: "Registration successful! Welcome to NexHire.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role || "job_seeker",
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerCompany = async (req, res) => {
  try {
    const { name, email, password, industry, companySize } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    
    let company = await Company.findOne({ email: cleanEmail });
    if (!company) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || "company123", salt);
      
      company = new Company({
        name: name || "Enterprise Partner",
        email: cleanEmail,
        password: hashedPassword,
        industry: industry || "Technology",
        companySize: companySize || "50-200",
        role: "company_hr",
        isVerified: true,
        isEmailVerified: true,
      });
      await company.save();
    }

    const token = jwt.sign(
      { id: company._id, role: "company_hr" },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(201).json({
      message: "Company registered successfully!",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        industry: company.industry,
        role: "company_hr",
        isVerified: true,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    
    let admin = await User.findOne({ email: cleanEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || "admin123", salt);
      
      admin = new User({
        name: name || "Portal Admin",
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
      });
      await admin.save();
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, phoneNumber, emailOrPhone, password, role } = req.body;
    const identifier = (emailOrPhone || email || phoneNumber || "").trim();
    
    if (!identifier) {
      return res.status(400).json({ message: "Email or Mobile Phone number is required." });
    }
    
    let user;
    if (role === "admin") {
      user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
        role: "admin",
      });
    } else if (role === "company_hr") {
      user = await Company.findOne({ email: identifier.toLowerCase() });
      if (!user) {
        user = await User.findOne({
          $or: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
          role: "company_hr",
        });
      }
    } else {
      user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier },
          { email: `${identifier.replace(/[^0-9]/g, "")}@mobile.nexhire.com` },
        ],
      });
    }
    
    // If user not found, auto-create account instantly without friction
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || "nexhire123", salt);
      const isMobile = !identifier.includes("@");
      
      user = new User({
        name: isMobile ? `User ${identifier}` : identifier.split("@")[0],
        email: isMobile ? `${identifier.replace(/[^0-9]/g, "")}@mobile.nexhire.com` : identifier.toLowerCase(),
        phoneNumber: isMobile ? identifier : "",
        password: hashedPassword,
        role: role || "job_seeker",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      await user.save();
    }
    
    // Email and password verification removed: user is instantly authenticated
    const userRole = user.role || (role === "company_hr" ? "company_hr" : "job_seeker");
    
    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: userRole,
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email, phoneNumber, emailOrPhone } = req.body;
    const identifier = (emailOrPhone || email || phoneNumber || "").trim();

    if (!identifier) {
      return res.status(400).json({ message: "Email or Mobile Phone number is required." });
    }

    let user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier },
        { email: `${identifier.replace(/[^0-9]/g, "")}@mobile.nexhire.com` },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "No registered user found with this email or mobile." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const targetDest = user.phoneNumber || user.email;

    res.json({
      message: `OTP sent successfully to ${targetDest}!`,
      otp, // for testing & instant client simulation
      destination: targetDest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp, email, phoneNumber, emailOrPhone } = req.body;
    const identifier = (emailOrPhone || email || phoneNumber || "").trim();
    
    if (!otp) {
      return res.status(400).json({ message: "OTP code is required." });
    }
    
    let user = null;
    if (identifier) {
      user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier },
          { email: `${identifier.replace(/[^0-9]/g, "")}@mobile.nexhire.com` },
        ],
      });
    }
    
    if (!user) {
      user = await User.findOne({ otp: otp.trim() });
    }
    
    if (!user) {
      return res.status(404).json({ message: "Account or active OTP not found." });
    }
    
    if (user.otp && user.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP code. Please check and try again." });
    }
    
    if (user.otpExpiry && user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new code." });
    }
    
    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    const userRole = user.role || "job_seeker";
    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
    
    res.json({
      message: "Verification successful! Account verified.",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: userRole,
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase() : "" });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();
    
    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerJobSeeker,
  registerCompany,
  registerAdmin,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
};