// src/components/OAuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  console.log("OAuthCallback loaded");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      console.error("No code present in URL.");
      navigate("/");
      return;
    }

    console.log("Found code:", code);

    fetch(`${process.env.REACT_APP_API_BASE}/api/auth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Callback response:", data);

        if (data.access_token && data.user) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("Token saved. Redirecting...");
          navigate("/profile", { state: { justLoggedIn: true } });
        } else {
          console.error("Missing token or user:", data);
          navigate("/");
        }
      })
.catch(err => {
  console.error("Callback error:", err);
  alert("Login failed. See console for details.");
  navigate("/");
});

  }, [navigate]);

  return (
    <div className="page-container">
      <h1 className="page-title">Logging you in...</h1>
    </div>
  );
}
