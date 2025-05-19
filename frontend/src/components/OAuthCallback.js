import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      console.error("No code in callback");
      navigate("/"); // fallback
      return;
    }

    // Send the code to the backend for validation and user info
    fetch(`${process.env.REACT_APP_API_BASE}/api/auth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/profile");
        } else {
          console.error("Login failed:", data);
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("Callback error:", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="page-container">
      <h1 className="page-title">Logging you in...</h1>
    </div>
  );
}
