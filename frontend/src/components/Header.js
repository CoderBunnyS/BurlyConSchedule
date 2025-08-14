import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/header.css";
import { hasRole } from "../utils/authUtils";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const clientId = process.env.REACT_APP_FUSIONAUTH_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_FUSIONAUTH_REDIRECT_URI;
  const logoutRedirect = process.env.REACT_APP_LOGOUT_REDIRECT;
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
    // Clear local session
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    
    // Redirect to FusionAuth logout URL
    const encodedPostLogout = encodeURIComponent(logoutRedirect);
    window.location.href = `${domain}/oauth2/logout?client_id=${clientId}&post_logout_redirect_uri=${encodedPostLogout}`;
  };
    
  const isLoggedIn = !!localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.given_name || user?.email?.split("@")[0] || "User";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="modern-header">
      <div className="modern-header-backdrop"></div>
      <div className="modern-header-inner">
        {/* Logo Section */}
        <div className="modern-logo">
          <a 
            href="https://burlycon.org" 
            className="modern-logo-link"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit BurlyCon.org"
          >
            <img
              src="https://burlycon.org/wp-content/uploads/2019/12/bc-logo-240.png"
              alt="BurlyCon Logo"
              className="modern-logo-image"
            />
            <div className="modern-logo-text">
              <span className="modern-logo-title">BurlyCon</span>
              <span className="modern-logo-subtitle">Volunteer Portal</span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="modern-nav-desktop">
          <div className="modern-nav-links">
            <Link to="/" className="modern-nav-link">
              <span className="modern-nav-icon">🏠</span>
              <span className="modern-nav-text">Home</span>
            </Link>
            
            <Link to="/volunteer" className="modern-nav-link">
              <span className="modern-nav-icon">📅</span>
              <span className="modern-nav-text">Volunteer</span>
            </Link>
            
            <Link to="/profile" className="modern-nav-link">
              <span className="modern-nav-icon">👤</span>
              <span className="modern-nav-text">My Profile</span>
            </Link>
            
            {(hasRole("Admin") || hasRole("Lead")) && (
              <Link to="/admin" className="modern-nav-link admin">
                <span className="modern-nav-icon">🛠️</span>
                <span className="modern-nav-text">Admin</span>
                <span className="modern-admin-badge">Admin</span>
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="modern-user-section">
            {isLoggedIn ? (
              <div className="modern-user-menu">
                <div className="modern-user-info">
                  <div className="modern-user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="modern-user-details">
                    <span className="modern-user-name">Hi, {userName}</span>
                    <span className="modern-user-status">Volunteer</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="modern-logout-button"
                  onClick={handleLogout}
                  title="Log Out"
                >
                  <span className="modern-logout-icon">🚪</span>
                  <span className="modern-logout-text">Log Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="modern-login-button"
                onClick={handleLogin}
              >
                <span className="modern-login-icon">🔐</span>
                <span className="modern-login-text">Log In</span>
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="modern-mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`modern-hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`modern-nav-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="modern-mobile-nav-content">
          {isLoggedIn && (
            <div className="modern-mobile-user-info">
              <div className="modern-mobile-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="modern-mobile-user-details">
                <span className="modern-mobile-user-name">Hi, {userName}</span>
                <span className="modern-mobile-user-status">Volunteer</span>
              </div>
            </div>
          )}

          <div className="modern-mobile-nav-links">
            <Link 
              to="/" 
              className="modern-mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="modern-nav-icon">🏠</span>
              <span className="modern-nav-text">Home</span>
            </Link>
            
            <Link 
              to="/volunteer" 
              className="modern-mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="modern-nav-icon">📅</span>
              <span className="modern-nav-text">Volunteer</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="modern-mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="modern-nav-icon">👤</span>
              <span className="modern-nav-text">My Profile</span>
            </Link>
            
            {(hasRole("Admin") || hasRole("Lead")) && (
              <Link 
                to="/admin" 
                className="modern-mobile-nav-link admin"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="modern-nav-icon">🛠️</span>
                <span className="modern-nav-text">Admin</span>
                <span className="modern-mobile-admin-badge">Admin</span>
              </Link>
            )}
          </div>

          <div className="modern-mobile-auth-section">
            {isLoggedIn ? (
              <button
                type="button"
                className="modern-mobile-logout-button"
                onClick={handleLogout}
              >
                <span className="modern-logout-icon">🚪</span>
                <span className="modern-logout-text">Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                className="modern-mobile-login-button"
                onClick={handleLogin}
              >
                <span className="modern-login-icon">🔐</span>
                <span className="modern-login-text">Log In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="modern-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}