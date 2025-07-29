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


    const userResponse = await fetch(`${FUSIONAUTH_DOMAIN}/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const profile = await userResponse.json();
    const faUser = profile.user || profile;

    // Use 'sub' as the unique identifier 
    const fusionAuthId = faUser.sub;


    if (!fusionAuthId || !faUser.email) {
      console.error("Missing required fields in FusionAuth response:", faUser);
      return res.status(400).json({
        message: "Missing required user fields from FusionAuth",
        profile: faUser
      });
    }

let user = await User.findOne({
  $or: [
    { fusionAuthId },
    { email: faUser.email }
  ]
});

if (!user) {
  user = await User.create({
    fusionAuthId,
    preferredName: faUser.given_name || faUser.firstName || faUser.fullName || faUser.email,
    email: faUser.email
  });
} else if (!user.fusionAuthId) {
  user.fusionAuthId = fusionAuthId;
  await user.save();
}


    res.json({ user, access_token: tokenData.access_token });
  } catch (err) {
    console.error("FusionAuth login failed", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;
