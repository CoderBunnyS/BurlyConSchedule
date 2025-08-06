// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const hourlyNeedsRoutes = require("./routes/hourlyNeedsRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const shiftRoleRoutes = require("./routes/shiftRoleRoutes");
const adminVolunteerRoutes = require("./routes/adminVolunteerRoutes");
const smsRoutes = require("./routes/sms");
const reminderJob = require("./jobs/reminderJob");

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};


//Handle OPTIONS preflight before any routes or redirect logic
app.options("*", cors(corsOptions));

//Apply CORS and JSON parsing for all other requests
app.use(cors(corsOptions));
app.use(express.json());

// Health-check endpoint
app.get("/health", (req, res) => res.send("Backend is alive 🎉"));

// Attach all your API routes
app.use("/api/shifts", shiftRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/shiftroles", shiftRoleRoutes);
app.use("/api/admin", adminVolunteerRoutes);
app.use("/api/hourlyneeds", hourlyNeedsRoutes);
app.use("/api/sms", smsRoutes);

// Override auth callback route to return JSON instead of redirect
app.post("/api/auth/callback", async (req, res) => {
  try {
    const result = await authRoutes.handleCallback(req); // your FusionAuth logic
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve React frontend build
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
);

// Graceful shutdown for your job worker
process.on("SIGINT", () => {
  console.log("Gracefully shutting down...");
  reminderJob.stop();
  process.exit(0);
});

// Start server
const port = process.env.PORT || 5001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  reminderJob.start();
});
