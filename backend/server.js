const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const hourlyNeedsRoutes = require("./routes/hourlyNeedsRoutes");
const authRoutes = require("./routes/authRoutes");

// SMS imports
const reminderJob = require("./jobs/reminderJob");
const smsRoutes = require("./routes/sms");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Active routes only
const volunteerRoutes = require("./routes/volunteerRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const shiftRoleRoutes = require("./routes/shiftRoleRoutes");
const adminVolunteerRoutes = require("./routes/adminVolunteerRoutes");

// Middleware to log requests (for debugging)
app.get('/health', (req, res) => {
  res.send('Backend is alive 🎉');
});

app.use("/api/shifts", shiftRoutes);
app.use("/api/volunteer", volunteerRoutes);  
app.use("/api/shiftroles", shiftRoleRoutes);
app.use("/api/admin", adminVolunteerRoutes);
app.use("/api/hourlyneeds", hourlyNeedsRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// SMS routes
app.use("/api/sms", smsRoutes);

// Serve React frontend (ADD THIS SECTION)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all handler for React Router (ADD THIS TOO)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  reminderJob.stop();
  process.exit(0);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
  
  // Start the SMS reminder job
  console.log('Starting SMS reminder system...');
  reminderJob.start();
});