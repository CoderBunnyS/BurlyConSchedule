// routes/authRoutes.js
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const User = require("../models/User");

const {
  FUSIONAUTH_CLIENT_ID,
  FUSIONAUTH_CLIENT_SECRET,
  FUSIONAUTH_DOMAIN,
  FUSIONAUTH_REDIRECT_URI
} = process.env;

router.post("/callback", async (req, res) => {
  const { code } = req.body;
  console.log("Callback POST received. req.body:", req.body);

  if (!code) {
    return res.status(400).json({ message: "Missing authorization code" });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`${FUSIONAUTH_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: FUSIONAUTH_CLIENT_ID,
        client_secret: FUSIONAUTH_CLIENT_SECRET,
        code,
        redirect_uri: FUSIONAUTH_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ Token exchange failed with status:", tokenResponse.status);
      console.error("💬 FusionAuth response:", tokenData);
      return res.status(400).json({
        message: "Token exchange failed",
        status: tokenResponse.status,
        fusionAuthError: tokenData
      });
    }

    // Pull claims from /userinfo 
    const userResponse = await fetch(`${FUSIONAUTH_DOMAIN}/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userResponse.json();
    const faUser = profile.user || profile;

    // Required identifiers
    const fusionAuthId = faUser.sub; 
    const email = faUser.email;

    if (!fusionAuthId || !email) {
      console.error("Missing required fields in FusionAuth response:", faUser);
      return res.status(400).json({
        message: "Missing required user fields from FusionAuth",
        profile: faUser
      });
    }

    //  Pick a display name: prefer your FA lambda’s claim, then standard ones, then email
    const preferredName =
      faUser.preferred_username || faUser.name || faUser.given_name || faUser.nickname || email;

    //  Single upsert so Mongo is always in sync
    const user = await User.findOneAndUpdate(
      { $or: [{ fusionAuthId }, { email }] },
      {
        $set: {
          fusionAuthId,
          email,
          preferredName
        }
      },
      { new: true, upsert: true }
    );

    // Return user + access token (frontend stores both)
    res.json({ user, access_token: tokenData.access_token });
  } catch (err) {
    console.error("FusionAuth login failed", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
