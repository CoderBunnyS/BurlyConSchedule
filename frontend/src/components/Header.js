import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";


export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link to="/">
          <img src={"https://burlycon.org/wp-content/uploads/2019/12/bc-logo-240.png"} alt="BurlyCon Logo" />
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/volunteer" className="nav-link">Volunteer</Link>
          <Link to="/profile" className="nav-link">My Profile</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
