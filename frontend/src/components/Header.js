import React from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";
import { hasRole } from "../utils/authUtils";

export default function Header() {
  const clientId = process.env.REACT_APP_FUSIONAUTH_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_FUSIONAUTH_REDIRECT_URI;
  const logoutRedirect = process.env.REACT_APP_LOGOUT_REDIRECT || "/";
  const domain = process.env.REACT_APP_FUSIONAUTH_DOMAIN;

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_FUSIONAUTH_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_FUSIONAUTH_REDIRECT_URI);
    const domain = process.env.REACT_APP_FUSIONAUTH_DOMAIN;
    const scope = encodeURIComponent("openid email profile");
  
    const authorizationUrl = `${domain}/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = authorizationUrl;
  };
  

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    const encodedPostLogout = encodeURIComponent(logoutRedirect);
    window.location.href = `${domain}/oauth2/logout?client_id=${clientId}&post_logout_redirect_uri=${encodedPostLogout}`;
  };

  const isLoggedIn = !!localStorage.getItem("access_token");

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
          {(hasRole("admin") || hasRole("lead")) && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}

          {isLoggedIn ? (
            <button
              type="button"
              className="login-button-header"
              onClick={handleLogout}
            >
              Log Out
            </button>
          ) : (
            <button
              type="button"
              className="login-button-header"
              onClick={handleLogin}
            >
              Log In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
