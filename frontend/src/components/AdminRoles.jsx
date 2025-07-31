import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";
import "../styles/shiftForm.css";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    responsibilities: "",
    physicalRequirements: "",
    pointOfContact: "",
    contactPhone: ""
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(err => console.error("Error loading roles:", err));
  }, []);

  const openForm = (role = null) => {
    if (role) {
      setEditingId(role._id);
      setFormData({
        name: role.name || "",
        location: role.location || "",
        responsibilities: role.responsibilities || "",
        physicalRequirements: role.physicalRequirements || "",
        pointOfContact: role.pointOfContact || "",
        contactPhone: role.contactPhone || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        location: "",
        responsibilities: "",
        physicalRequirements: "",
        pointOfContact: "",
        contactPhone: ""
      });
    }
    setFormVisible(true);
  };

  const closeForm = () => setFormVisible(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${process.env.REACT_APP_API_BASE}/api/shiftroles/${editingId}`
      : `${process.env.REACT_APP_API_BASE}/api/shiftroles`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const newRole = await res.json();

      if (editingId) setRoles(prev => prev.map(r => (r._id === editingId ? newRole : r)));
      else setRoles(prev => [...prev, newRole]);

      closeForm();
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this role?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles/${id}`, {
        method: "DELETE"
      });
      if (res.ok) setRoles(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Modern Header Section */}
      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">Volunteer Role Management</h1>
          <p className="modern-page-subtitle">Create and manage volunteer opportunities</p>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Add Role Button */}
        <div className="modern-action-bar">
          <button
            onClick={() => openForm()}
            className="modern-primary-button"
          >
            <span className="button-icon">➕</span>
            Add New Role
          </button>
        </div>

        {/* Form Modal */}
        {formVisible && (
          <div className="modern-modal-overlay">
            <div className="modern-modal">
              <div className="modern-modal-header">
                <div className="modern-modal-title-section">
                  <h2 className="modern-modal-title">
                    {editingId ? "Edit Role" : "Create New Role"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="modern-close-button"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="modern-modal-content">
                <form onSubmit={handleSubmit} className="modern-form">
                  {/* Role Name */}
                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      📋 Role Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="modern-form-input"
                      placeholder="e.g., Event Coordinator"
                    />
                  </div>

                  {/* Location */}
                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      📍 Location
                    </label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="modern-form-input"
                      placeholder="e.g., Main Venue, Building A"
                    />
                  </div>

                  {/* Responsibilities */}
                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      📝 Responsibilities *
                    </label>
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="modern-form-textarea"
                      placeholder="Describe the key responsibilities and duties..."
                    />
                  </div>

                  {/* Physical Requirements */}
                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      👤 Physical Requirements
                    </label>
                    <textarea
                      name="physicalRequirements"
                      value={formData.physicalRequirements}
                      onChange={handleChange}
                      rows={3}
                      className="modern-form-textarea"
                      placeholder="Any physical requirements or limitations..."
                    />
                  </div>

                  {/* Contact Fields */}
                  <div className="modern-form-row">
                    <div className="modern-form-group">
                      <label className="modern-form-label">
                        👤 Point of Contact
                      </label>
                      <input
                        name="pointOfContact"
                        value={formData.pointOfContact}
                        onChange={handleChange}
                        className="modern-form-input"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div className="modern-form-group">
                      <label className="modern-form-label">
                        📞 Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="modern-form-input"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="modern-form-actions">
                    <button
                      type="submit"
                      className="modern-submit-button"
                    >
                      💾 {editingId ? "Save Changes" : "Create Role"}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="modern-cancel-button"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Roles Section */}
        <div className="modern-roles-section">
          <div className="modern-section-header">
            <h2 className="modern-section-title">
              Current Roles ({roles.length})
            </h2>
          </div>

          {roles.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">📋</div>
              <h3 className="modern-empty-title">No roles yet</h3>
              <p className="modern-empty-description">Create your first volunteer role to get started</p>
              <button
                onClick={() => openForm()}
                className="modern-primary-button"
              >
                <span className="button-icon">➕</span>
                Add First Role
              </button>
            </div>
          ) : (
            <div className="modern-roles-grid">
              {roles.map(role => (
                <div key={role._id} className="modern-role-card">
                  {/* Card Header */}
                  <div className="modern-card-header">
                    <div className="modern-card-title-section">
                      <h3 className="modern-card-title">{role.name}</h3>
                      <div className="modern-card-actions">
                        <button
                          onClick={() => openForm(role)}
                          className="modern-edit-button"
                          title="Edit role"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(role._id)}
                          className="modern-delete-button"
                          title="Delete role"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {role.location && (
                      <div className="modern-location-tag">
                        📍 {role.location}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="modern-card-content">
                    {/* Responsibilities */}
                    <div className="modern-card-section">
                      <h4 className="modern-card-section-title">
                        📝 Responsibilities
                      </h4>
                      <p className="modern-card-text">
                        {role.responsibilities}
                      </p>
                    </div>

                    {/* Physical Requirements */}
                    {role.physicalRequirements && (
                      <div className="modern-card-section">
                        <h4 className="modern-card-section-title">
                          👤 Physical Requirements
                        </h4>
                        <p className="modern-card-text">
                          {role.physicalRequirements}
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    {(role.pointOfContact || role.contactPhone) && (
                      <div className="modern-card-contact">
                        <h4 className="modern-card-section-title">Contact</h4>
                        <div className="modern-contact-info">
                          {role.pointOfContact && (
                            <p className="modern-contact-item">
                              👤 {role.pointOfContact}
                            </p>
                          )}
                          {role.contactPhone && (
                            <a
                              href={`tel:${role.contactPhone}`}
                              className="modern-contact-phone"
                            >
                              📞 {role.contactPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}