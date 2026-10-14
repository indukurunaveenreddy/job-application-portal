const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: String, required: true },
    salary: { type: String },
    minSalaryLpa: { type: Number, default: 3 },
    category: {
      type: String,
      enum: ["IT", "Non-IT", "Civil", "Security", "Air Force", "Other"],
      default: "IT",
    },
    employmentType: { 
      type: String, 
      enum: ["full-time", "part-time", "contract", "internship"] 
    },
    experienceLevel: { 
      type: String, 
      enum: ["entry-level", "mid-level", "senior", "lead"] 
    },
    skills: [{ type: String }],
    applyUrl: { type: String },
    companyWebsite: { type: String },
    city: { 
      type: String, 
      enum: ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Remote", "Other"],
      default: "Bangalore" 
    },
    source: {
      type: String,
      enum: ["LinkedIn", "Naukri", "Unstop", "Company Careers", "Other"],
      default: "LinkedIn"
    },
    externalJobId: { type: String },
    status: { 
      type: String, 
      enum: ["active", "inactive", "fraud"], 
      default: "active" 
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);