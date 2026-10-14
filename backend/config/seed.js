const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Company = require("../models/Company.model");
const Job = require("../models/Job.model");

const seedData = async () => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount > 0) {
      console.log("Database already seeded with jobs.");
      return;
    }

    console.log("Seeding initial database demo data...");
    const salt = await bcrypt.genSalt(10);

    // 1. Seed Company (needed for job listings)
    let company = await Company.findOne({ email: "hr@techcorp.com" });
    if (!company) {
      company = await Company.create({
        name: "TechCorp Solutions",
        email: "hr@techcorp.com",
        password: await bcrypt.hash("company123", salt),
        industry: "Information Technology",
        companySize: "100-500",
        website: "https://techcorp.example.com",
        role: "company_hr",
        isVerified: true,
        isEmailVerified: true,
      });
    }

    // 2. Seed Job Seeker (demo account)
    let seeker = await User.findOne({ email: "seeker@portal.com" });
    if (!seeker) {
      seeker = await User.create({
        name: "Alex Morgan",
        email: "seeker@portal.com",
        password: await bcrypt.hash("seeker123", salt),
        role: "job_seeker",
        phoneNumber: "+15550192834",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
    }

    // 3. Seed Admin User (Naveenreddy / 8639)
    let admin = await User.findOne({ email: "admin@nexhire.in" });
    if (!admin) {
      admin = await User.create({
        name: "Naveenreddy",
        email: "admin@nexhire.in",
        password: await bcrypt.hash("8639", salt),
        role: "admin",
        phoneNumber: "+91 8639000000",
        isPhoneVerified: true,
        isEmailVerified: true,
      });
    }

    // 4. Seed Sample Jobs
    await Job.create([
      {
        title: "Senior Full-Stack Engineer",
        description: "Looking for an experienced full-stack engineer proficient in React, Node.js, and MongoDB to architect scalable web apps.",
        company: company._id,
        location: "Remote / San Francisco, CA",
        salary: "$130,000 - $160,000",
        employmentType: "full-time",
        experienceLevel: "senior",
        skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Frontend UI/UX Developer",
        description: "Join our core product design system team building responsive, highly animated, and modern web dashboards.",
        company: company._id,
        location: "New York, NY (Hybrid)",
        salary: "$110,000 - $135,000",
        employmentType: "full-time",
        experienceLevel: "mid-level",
        skills: ["React", "JavaScript", "CSS3", "Figma", "Responsive Design"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Backend Platform Engineer",
        description: "Design high throughput RESTful services, database optimizations, and secure authentication flows.",
        company: company._id,
        location: "Austin, TX (Remote)",
        salary: "$120,000 - $150,000",
        employmentType: "full-time",
        experienceLevel: "senior",
        skills: ["Node.js", "MongoDB", "Microservices", "REST APIs", "Security"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Civil Site Engineer & Construction Supervisor",
        description: "Oversee structural construction, site quality assurance, concrete pours, surveying, and subcontractor management for premier infrastructure projects.",
        company: company._id,
        location: "Bangalore, Karnataka",
        salary: "₹4,80,000 - ₹9,50,000 / yr",
        category: "Civil",
        employmentType: "full-time",
        experienceLevel: "entry-level",
        skills: ["AutoCAD Civil", "Site Supervision", "RCC Construction", "BOQ & Estimation", "Surveying"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Cyber Security Analyst & Threat Hunter",
        description: "Protect critical enterprise networks, monitor real-time SIEM alerts, perform vulnerability assessments, and mitigate zero-day attack vectors.",
        company: company._id,
        location: "Hyderabad, Telangana",
        salary: "₹7,50,000 - ₹16,00,000 / yr",
        category: "Security",
        employmentType: "full-time",
        experienceLevel: "mid-level",
        skills: ["SIEM (Splunk)", "SOC Analysis", "VAPT", "Firewalls", "Incident Response"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Indian Air Force (IAF) - Commissioned Officer (Flying & Ground Duty Technical)",
        description: "Lead cutting-edge military aviation wings, oversee radar networks, airbase security, and precision aerospace engineering systems for national defense.",
        company: company._id,
        location: "Bangalore / Air Force Station Yelahanka",
        salary: "₹8,50,000 - ₹19,50,000 / yr + Defense Perks",
        category: "Air Force",
        employmentType: "full-time",
        experienceLevel: "mid-level",
        skills: ["Aeronautical Engineering", "AFCAT Qualified", "Radar & Avionics", "Airbase Security", "Flight Systems"],
        status: "active",
        createdBy: company._id,
      },
      {
        title: "Suspicious Data Entry - $10k/wk Quick Payout",
        description: "No experience needed! Immediate payout of $10,000 per week. Please transfer registration fee to unlock dashboard.",
        company: company._id,
        location: "Anywhere",
        salary: "$520,000",
        employmentType: "part-time",
        experienceLevel: "entry-level",
        skills: ["Typing", "Internet"],
        status: "fraud", // Flagged by Admin
        createdBy: company._id,
      },
    ]);

    // Seed Demo Application
    const Application = require("../models/Application.model");
    const appCount = await Application.countDocuments();
    if (appCount === 0 && seeker) {
      const activeJob = await Job.findOne({ status: "active" });
      if (activeJob) {
        await Application.create({
          job: activeJob._id,
          applicant: seeker._id,
          candidateName: seeker.name,
          candidateEmail: seeker.email,
          candidatePhone: seeker.phoneNumber || "+15550192834",
          resumeUrl: "https://drive.google.com/alex-morgan-resume.pdf",
          portfolioUrl: "https://github.com/alexmorgan-dev",
          experienceYears: "4.5 Years",
          expectedSalary: "₹28,00,000 / yr",
          noticePeriod: "15 Days",
          coverLetter: "Excited about this opening. Strong background in React, Node.js, and cloud systems.",
          status: "Interview Scheduled",
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        });
      }
    }

    console.log("Seeding completed successfully!");
    console.log("-----------------------------------------");
    console.log("Demo Credentials Available:");
    console.log("Job Seeker: seeker@portal.com / seeker123");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Seeding error:", error.message);
  }
};

module.exports = seedData;
