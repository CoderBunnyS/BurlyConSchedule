import React from "react";
import "../styles/home.css";
import Header from "./Header";

export default function Home() {
  return (
    <div className="page-container">
          <Header  />
      <h1 className="page-title">Welcome to the BurlyCon Volunteer Portal</h1>

      <p className="page-subtitle">
        Thank you for being a vital part of BurlyCon! This space is just for you—our volunteers.
        Here, you can view open shifts, manage your schedule, and track your hours.
      </p>

      <section className="info-section">

        <h2 className="section-heading">What You Can Do Here</h2>
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
          If you have any questions, issues, or just want to check in, please don’t hesitate to reach out to the
          <a href="mailto:bunny@burlycon.org" className="email-link"> Volunteer Coordinator</a>.
        </p>
      </section>

      <div className="home-buttons">
        <a href="/volunteer" className="button">View Volunteer Shifts</a>
        <a href="/profile" className="button">My Profile</a>
        <a href="/admin" className="button admin-button">Admin Panel</a>
      </div>
    </div>
  );
}
