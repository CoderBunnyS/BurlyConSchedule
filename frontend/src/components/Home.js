import React from "react";
import "../styles/home.css"; // Using the same modern CSS
import Header from "./Header";

export default function Home() {
  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Hero Section */}
      <div className="modern-hero-section">
        <div className="modern-hero-content">
          <h1 className="modern-hero-title">✨ BurlyCon Sparkle Squad ✨</h1>
          <p className="modern-hero-subtitle">
            Welcome, volunteer! This space is just for you—your dashboard to help make the magic happen.
          </p>
        </div>
        <div className="modern-hero-decoration">
          <div className="modern-sparkle modern-sparkle-1">✨</div>
          <div className="modern-sparkle modern-sparkle-2">⭐</div>
          <div className="modern-sparkle modern-sparkle-3">✨</div>
          <div className="modern-sparkle modern-sparkle-4">🌟</div>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Features Section */}
        <section className="modern-features-section">
          <div className="modern-section-header">
                    {/* Action Buttons */}
        <div className="modern-home-actions">
          <h3 className="modern-actions-title">Ready to Get Started?</h3>
          <div className="modern-action-buttons">
            <a href="/volunteer" className="modern-home-button primary">
              <span className="modern-button-icon">📅</span>
              <span className="modern-button-content">
                <span className="modern-button-title">View Shifts</span>
                <span className="modern-button-subtitle">Browse available opportunities</span>
              </span>
            </a>
            
            <a href="/profile" className="modern-home-button secondary">
              <span className="modern-button-icon">👤</span>
              <span className="modern-button-content">
                <span className="modern-button-title">My Profile</span>
                <span className="modern-button-subtitle">Manage your volunteer info</span>
              </span>
            </a>
          </div>
        </div>
          </div>
          

              <div className="modern-feature-glow">
                
              </div>


        </section>

        {/* Help Section */}
        <section className="modern-help-section">
          <div className="modern-help-card">
            <div className="modern-help-icon">🤝</div>
            <div className="modern-help-content">
              <h3 className="modern-help-title">Need Help?</h3>
              <p className="modern-help-description">
                Our Volunteer Coordinator is here to support you every step of the way
              </p>
              <a 
                href="mailto:bunny@burlycon.org" 
                className="modern-help-link"
              >
                📧 Contact Volunteer Coordinator
              </a>
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}