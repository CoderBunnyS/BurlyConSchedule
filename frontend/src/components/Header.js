import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
  // Grab environment variables safely
  const clientId = process.env.REACT_APP_FUSIONAUTH_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_FUSIONAUTH_REDIRECT_URI;
  const domain = process.env.REACT_APP_FUSIONAUTH_DOMAIN;

  const handleLogin = () => {
    if (!clientId || !redirectUri || !domain) {
      console.error("FusionAuth environment variables are missing.");
      return;
    }

    const encodedRedirect = encodeURIComponent(redirectUri);
    window.location.href = `${domain}/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirect}&response_type=code&scope=openid`;
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link to="/">
            <img
              src="https://burlycon.org/wp-content/uploads/2019/12/bc-logo-240.png"
              alt="BurlyCon Logo"
            />
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/volunteer" className="nav-link">Volunteer</Link>
          <Link to="/profile" className="nav-link">My Profile</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
          <button
            type="button"
            className="login-button-header"
            onClick={handleLogin}
          >
            Log In
          </button>
        </nav>
      </div>
    </header>
  );
}
