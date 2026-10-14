const express = require("express");
const router = express.Router();
const {
  registerJobSeeker,
  registerCompany,
  registerAdmin,
  login,
  sendOTP,
  verifyOTP,
  forgotPassword,
} = require("../controllers/auth.controller");
const { auth, roleCheck } = require("../middleware/auth.middleware");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCompanyJobs,
} = require("../controllers/job.controller");

// Auth routes
router.post("/register/job-seeker", registerJobSeeker);
router.post("/register/job_seeker", registerJobSeeker);
router.post("/register/company", registerCompany);
router.post("/register/company_hr", registerCompany);
router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.post("/login/:role", login);
router.post("/send-otp", sendOTP);
router.post("/auth/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);

// Current user profile
router.get("/me", auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isPhoneVerified: req.user.isPhoneVerified,
      isEmailVerified: req.user.isEmailVerified,
    },
  });
});

// Job routes
router.post("/jobs/sync-daily", async (req, res) => {
  try {
    const { syncDailyJobs } = require("../services/jobCrawler.service");
    const count = req.body && req.body.count ? parseInt(req.body.count) : 5000;
    const result = await syncDailyJobs(count);
    res.json({ message: `Successfully synced up to ${count} daily jobs from LinkedIn, Naukri & Unstop!`, ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/jobs/stats", async (req, res) => {
  try {
    const Job = require("../models/Job.model");
    const total = await Job.countDocuments();
    const blr = await Job.countDocuments({ $or: [{ city: "Bangalore" }, { location: /bengaluru|bangalore/i }] });
    const hyd = await Job.countDocuments({ $or: [{ city: "Hyderabad" }, { location: /hyderabad/i }] });
    const pune = await Job.countDocuments({ $or: [{ city: "Pune" }, { location: /pune/i }] });
    const mumbai = await Job.countDocuments({ $or: [{ city: "Mumbai" }, { location: /mumbai|navi mumbai/i }] });
    const linkedIn = await Job.countDocuments({ source: "LinkedIn" });
    const naukri = await Job.countDocuments({ source: "Naukri" });
    const unstop = await Job.countDocuments({ source: "Unstop" });
    const itCount = await Job.countDocuments({ category: "IT" });
    const nonItCount = await Job.countDocuments({ category: "Non-IT" });
    const civilCount = await Job.countDocuments({ category: "Civil" });
    const securityCount = await Job.countDocuments({ category: "Security" });
    const airForceCount = await Job.countDocuments({ category: "Air Force" });
    res.json({ total, blr, hyd, pune, mumbai, linkedIn, naukri, unstop, itCount, nonItCount, civilCount, securityCount, airForceCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Users List: View all registered users with their name, email, and phone number
router.get("/admin/users", async (req, res) => {
  try {
    const User = require("../models/User.model");
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const {
  submitApplication,
  getMyApplications,
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
} = require("../controllers/application.controller");

// Application routes
router.post("/applications", submitApplication);
router.get("/applications/my", getMyApplications);
router.get("/applications/job/:jobId", getJobApplications);
router.get("/applications", getAllApplications);
router.put("/applications/:id/status", updateApplicationStatus);

router.post("/jobs", auth, roleCheck(["company_hr", "admin"]), createJob);
router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);
router.put("/jobs/:id", auth, roleCheck(["company_hr", "admin"]), updateJob);
router.delete("/jobs/:id", auth, roleCheck(["company_hr", "admin"]), deleteJob);
router.get("/company/jobs/:companyId", auth, roleCheck(["company_hr", "admin"]), getCompanyJobs);
router.get("/my-jobs", auth, roleCheck(["company_hr", "admin"]), getCompanyJobs);

module.exports = router;