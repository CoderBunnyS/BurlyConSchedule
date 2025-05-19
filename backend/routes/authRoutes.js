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

  try {
    // Exchange code for token
    const tokenRes = await fetch(`${FUSIONAUTH_DOMAIN}/oauth2/token`, {
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

    const tokenData = await tokenRes.json();
    const userRes = await fetch(`${FUSIONAUTH_DOMAIN}/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const profile = await userRes.json();

    // Find or create user
    let user = await User.findOne({ fusionAuthId: profile.sub });
    if (!user) {
      user = await User.create({
        fusionAuthId: profile.sub,
        preferredName: profile.name || profile.email,
        email: profile.email
      });
    }

    res.json({ user });
  } catch (err) {
    console.error("FusionAuth login failed", err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
