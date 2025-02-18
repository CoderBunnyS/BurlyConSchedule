const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Ensure these routes are imported correctly
const classRoutes = require("./routes/classRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const userRoutes = require("./routes/userRoutes");

// ✅ Ensure these are correctly used as middleware
app.use("/api/classes", classRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
