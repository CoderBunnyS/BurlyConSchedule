const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const hourlyNeedsRoutes = require("./routes/hourlyNeedsRoutes");



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


app.use("/api/shifts", shiftRoutes);
app.use("/api/shifts", volunteerRoutes); 
app.use("/api/shiftroles", shiftRoleRoutes);
app.use("/api/admin", adminVolunteerRoutes);
app.use("/api/hourlyneeds", hourlyNeedsRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
