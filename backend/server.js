const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jobRoutes = require("./routes/job.routes");
const seedData = require("./config/seed");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", jobRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/job-portal-db";

const startServer = async () => {
  let connected = false;
  
  // Try connecting to local/provided MongoDB
  try {
    console.log(`Attempting to connect to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("Connected to local MongoDB");
    connected = true;
  } catch (err) {
    console.log("Local MongoDB not available. Starting in-memory MongoDB fallback...");
  }

  // Fallback to in-memory Mongo if local isn't reachable
  if (!connected) {
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      console.log(`Connecting to in-memory MongoDB at ${memoryUri}...`);
      await mongoose.connect(memoryUri);
      console.log("Connected to in-memory MongoDB");
    } catch (err) {
      console.error("Failed to start MongoDB instance:", err);
      process.exit(1);
    }
  }

  // Seed sample data
  await seedData();

  // Initialize automated 24-hour Bangalore & Hyderabad Job Crawler
  const { initDailyScheduler } = require("./services/jobCrawler.service");
  initDailyScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;