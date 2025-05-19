import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      console.error("No code found");
      return;
    }

    // Exchange code for user info
    fetch(`${process.env.REACT_APP_API_BASE}/api/auth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/profile");
        } else {
          console.error("No user returned:", data);
        }
      })
      .catch((err) => {
        console.error("Error during callback:", err);
      });
  }, [navigate]);

  return (
    <div className="page-container">
      <h1>Logging you in...</h1>
    </div>
  );
}
