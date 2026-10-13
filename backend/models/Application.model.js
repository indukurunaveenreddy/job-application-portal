const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User" },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String, required: true },
    resumeUrl: { type: String },
    portfolioUrl: { type: String },
    experienceYears: { type: String },
    expectedSalary: { type: String },
    noticePeriod: { type: String },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Offer Extended",
        "Rejected",
      ],
      default: "Submitted",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
