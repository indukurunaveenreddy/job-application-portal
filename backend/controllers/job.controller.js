const Job = require("../models/Job.model");
const User = require("../models/User.model");
const Company = require("../models/Company.model");

const createJob = async (req, res) => {
  try {
    const { title, description, location, salary, employmentType, experienceLevel, skills } = req.body;
    const companyId = req.user.id || req.user._id;
    
    let company = await Company.findById(companyId);
    if (!company) {
      company = await Company.findOne({ email: req.user.email });
    }
    if (!company) {
      company = await Company.findOne();
    }
    if (!company) {
      company = new Company({
        name: req.user.name || "Default Company",
        email: req.user.email || "company@domain.com",
        password: "password123",
        industry: "Technology",
      });
      await company.save();
    }
    
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    
    const job = new Job({
      title,
      description,
      company: company._id,
      location,
      salary,
      employmentType: employmentType || "full-time",
      experienceLevel: experienceLevel || "mid-level",
      skills: parsedSkills,
      createdBy: req.user._id,
    });
    
    await job.save();
    const populated = await Job.findById(job._id).populate("company", "name industry");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { status, location, employmentType, experienceLevel, city, source, category, minLpa, search, limit, page } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (employmentType) query.employmentType = employmentType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (source) query.source = source;
    if (category) query.category = category;
    if (minLpa) query.minSalaryLpa = { $gte: parseFloat(minLpa) };

    if (city) {
      if (city === "Bangalore") {
        query.$or = [{ city: "Bangalore" }, { location: /bengaluru|bangalore/i }];
      } else if (city === "Hyderabad") {
        query.$or = [{ city: "Hyderabad" }, { location: /hyderabad/i }];
      } else if (city === "Pune") {
        query.$or = [{ city: "Pune" }, { location: /pune/i }];
      } else if (city === "Mumbai") {
        query.$or = [{ city: "Mumbai" }, { location: /mumbai|navi mumbai/i }];
      } else {
        query.city = city;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { skills: searchRegex },
      ];
    } else if (location) {
      query.location = new RegExp(location, "i");
    }
    
    const maxLimit = limit ? Math.min(parseInt(limit), 5000) : 5000;
    const pageNum = page ? Math.max(parseInt(page), 1) : 1;
    const skip = (pageNum - 1) * maxLimit;
    
    const totalCount = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(maxLimit)
      .populate("company", "name industry website")
      .populate("createdBy", "name");

    const enrichedJobs = jobs.map((j) => {
      const obj = j.toObject ? j.toObject() : { ...j };
      if (!obj.companyWebsite && obj.company?.website) {
        obj.companyWebsite = obj.company.website;
      }
      return obj;
    });
    
    if (req.query.format === "meta") {
      return res.json({
        total: totalCount,
        page: pageNum,
        limit: maxLimit,
        jobs: enrichedJobs,
      });
    }

    res.json(enrichedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company", "name industry website")
      .populate("createdBy", "name");
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const jobObj = job.toObject ? job.toObject() : { ...job };
    if (!jobObj.companyWebsite && jobObj.company?.website) {
      jobObj.companyWebsite = jobObj.company.website;
    }
    
    res.json(jobObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if the user is the creator or admin
    if (job.createdBy && job.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }
    
    const { status, title, description, location, salary, employmentType, experienceLevel, skills } = req.body;
    if (status !== undefined) job.status = status;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (location !== undefined) job.location = location;
    if (salary !== undefined) job.salary = salary;
    if (employmentType !== undefined) job.employmentType = employmentType;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
    job.updatedAt = Date.now();
    
    await job.save();
    const populated = await Job.findById(job._id).populate("company", "name industry");
    res.json(populated || job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if the user is the creator or admin
    if (job.createdBy && job.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }
    
    await job.deleteOne();
    res.json({ message: "Job removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.role === "admin" ? req.params.companyId : req.user._id;
    
    let query;
    if (req.user.role === "admin") {
      query = { company: req.params.companyId };
    } else {
      query = { company: req.user._id };
    }
    
    const jobs = await Job.find(query).populate("company", "name industry");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCompanyJobs,
};