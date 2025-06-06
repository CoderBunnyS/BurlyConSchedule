import React from "react";
import "../styles/home.css";
import Header from "./Header";

export default function Home() {
  return (
    <div className="page-container">
      <Header />

      <h1 className="page-title">✨ BurlyCon Sparkle Squad ✨</h1>

      <p className="page-subtitle">
        Welcome, volunteer! This space is just for you—your dashboard to help make the magic happen.
      </p>

      <section className="info-section">
        <h2 className="section-heading">What You Can Do Here</h2>
        <div className="info-grid">
          <div className="info-card">
            <span className="info-icon">📅</span>
            <p>Browse and sign up for shifts</p>
          </div>
          <div className="info-card">
            <span className="info-icon">✅</span>
            <p>Track your hours & confirmed roles</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🔁</span>
            <p>Cancel or adjust shifts as needed</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📨</span>
            <p>Message the Volunteer Coordinator</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2 className="section-heading">Need Help?</h2>
        <p>
          Email the{" "}
          <a href="mailto:bunny@burlycon.org" className="email-link">
            Volunteer Coordinator
          </a>{" "}
          for support!
        </p>
      </section>

      <div className="home-buttons">
        <a href="/volunteer" className="home-button">
          View Shifts
        </a>
        <a href="/profile" className="home-button">
          My Profile
        </a>
      </div>
    </div>
  );
}
