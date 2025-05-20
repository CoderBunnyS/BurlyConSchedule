import React from "react";
import "../styles/home.css";
import Header from "./Header";

export default function Home() {
  const handleLogin = () => {
    const authorizationUrl = `${process.env.REACT_APP_FUSIONAUTH_DOMAIN}/oauth2/authorize?client_id=${process.env.REACT_APP_FUSIONAUTH_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_FUSIONAUTH_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = authorizationUrl;
  };
  

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Welcome to the BurlyCon <br />Sparkle Squad</h1>

      <p className="page-subtitle">
        Thank you for being a vital part of BurlyCon! This space is just for you—our volunteers.
      </p>

      {/* <div className="home-login-section">
        <button className="login-button" onClick={handleLogin}>
          🔐 Login with FusionAuth
        </button>
      </div> */}

      <section className="info-section">
        <h2 className="section-heading">✨ What You Can Do</h2>
        <ul className="info-list">
          <li>📅 Browse available volunteer shifts by day and role</li>
          <li>🧍 Sign up for shifts that match your interests and availability</li>
          <li>✅ View your confirmed shifts and total volunteer hours</li>
          <li>🔁 Cancel or adjust shifts as needed</li>
          <li>📨 Reach out to the Volunteer Coordinator for support</li>
        </ul>
      </section>

      <section className="info-section">
        <h2 className="section-heading">Need Help?</h2>
        <p>
          Email the{" "}
          <a href="mailto:bunny@burlycon.org" className="email-link">
            Volunteer Coordinator
          </a>{" "}
          with any questions.
        </p>
      </section>

      <div className="home-buttons">
        <a href="/volunteer" className="button">View Shifts</a>
        <a href="/profile" className="button">My Profile</a>
        <a href="/admin" className="button admin-button">Admin Panel</a>
      </div>
    </div>
  );
}
