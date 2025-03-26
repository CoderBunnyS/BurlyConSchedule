const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Active routes only
const volunteerRoutes = require("./routes/volunteerRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const shiftRoleRoutes = require("./routes/shiftRoleRoutes");

app.use("/api/volunteer", volunteerRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/shiftroles", shiftRoleRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
