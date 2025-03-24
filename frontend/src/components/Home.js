import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">BurlyCon Volunteer Portal</h1>
      <p className="home-subtitle">Support the community. Claim your shifts. Shine bright.</p>

      <div className="home-buttons">
        <Link to="/volunteer" className="home-button">View Volunteer Shifts</Link>
        <Link to="/profile" className="home-button">My Profile</Link>
        <Link to="/admin" className="home-button admin">Admin Panel</Link>
      </div>
    </div>
  );
}
