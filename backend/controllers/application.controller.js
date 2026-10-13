const Application = require("../models/Application.model");
const Job = require("../models/Job.model");
const User = require("../models/User.model");

// Submit a new Job Application
const submitApplication = async (req, res) => {
  try {
    const {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      resumeUrl,
      portfolioUrl,
      experienceYears,
      expectedSalary,
      noticePeriod,
      coverLetter,
    } = req.body;

    if (!jobId || !candidateName || !candidateEmail) {
      return res.status(400).json({ message: "Job ID, Name, and Email are required." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const applicantId = req.user ? req.user._id : null;

    // Check if duplicate application
    let existing;
    if (applicantId) {
      existing = await Application.findOne({ job: jobId, applicant: applicantId });
    } else {
      existing = await Application.findOne({
        job: jobId,
        $or: [{ candidateEmail }, { candidatePhone }],
      });
    }

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted an application for this position.",
        applicationId: existing._id,
      });
    }

    // Update user contact info in User collection if applicantId exists
    if (applicantId) {
      await User.findByIdAndUpdate(applicantId, {
        ...(candidatePhone ? { phoneNumber: candidatePhone } : {}),
        ...(candidateEmail ? { email: candidateEmail } : {}),
      });
    }

    const application = new Application({
      job: jobId,
      applicant: applicantId,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      candidatePhone: (candidatePhone || "+91 98765 43210").trim(),
      resumeUrl: resumeUrl || "https://drive.google.com/resume-preview",
      portfolioUrl: portfolioUrl || "https://github.com/profile",
      experienceYears: experienceYears || "3+ Years",
      expectedSalary: expectedSalary || "₹24 LPA",
      noticePeriod: noticePeriod || "Immediate / 15 Days",
      coverLetter: coverLetter || "Excited about this opportunity and ready to contribute.",
      status: "Submitted",
      appliedAt: new Date(),
    });

    await application.save();
    const populated = await Application.findById(application._id).populate({
      path: "job",
      populate: { path: "company", select: "name industry website" },
    });

    res.status(201).json({
      message: "Job Application submitted successfully!",
      application: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current seeker's applications
const getMyApplications = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      query.$or = [
        { applicant: req.user._id },
        { candidateEmail: req.user.email },
        ...(req.user.phoneNumber ? [{ candidatePhone: req.user.phoneNumber }] : []),
      ];
    } else if (req.query.email) {
      query.$or = [
        { candidateEmail: req.query.email },
        ...(req.query.phone ? [{ candidatePhone: req.query.phone }] : []),
      ];
    } else if (req.query.phone) {
      query.candidatePhone = req.query.phone;
    } else {
      query = {};
    }

    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .populate({
        path: "job",
        populate: { path: "company", select: "name industry website" },
      });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for a specific job
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
      .sort({ appliedAt: -1 })
      .populate("applicant", "name email phoneNumber");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all applications (Admin & HR)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(100)
      .populate({
        path: "job",
        populate: { path: "company", select: "name industry" },
      });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (status) {
      application.status = status;
    }
    await application.save();

    const populated = await Application.findById(id).populate({
      path: "job",
      populate: { path: "company", select: "name industry" },
    });

    res.json({ message: "Application status updated", application: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
};
