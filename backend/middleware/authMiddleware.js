const axios = require("axios");
const User = require("../models/User");

const FA_BASE = process.env.FUSIONAUTH_BASE_URL;

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const faResponse = await axios.get(`${FA_BASE}/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { sub: fusionAuthId, email, name } = faResponse.data;

    let user = await User.findOne({ fusionAuthId });
    if (!user) {
      user = new User({
        fusionAuthId,
        email,
        preferredName: name || email.split("@")[0],
        volunteerShifts: [],
        totalHours: 0,
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticateUser;
