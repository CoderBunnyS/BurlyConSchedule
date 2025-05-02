import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";
import "../styles/shiftForm.css";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
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
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error loading roles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${process.env.REACT_APP_API_BASE}/api/shiftroles/${editingId}`
      : `${process.env.REACT_APP_API_BASE}/api/shiftroles`;

    const payload = {
      name: formData.name,
      location: formData.location,
      responsibilities: formData.responsibilities,
      physicalRequirements: formData.physicalRequirements,
      pointOfContact: formData.pointOfContact,
      contactPhone: formData.contactPhone,
    };

    try {
      console.log("Form data being submitted:", formData);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newRole = await res.json();

      if (editingId) {
        setRoles((prev) =>
          prev.map((r) => (r._id === editingId ? newRole : r))
        );
      } else {
        setRoles((prev) => [...prev, newRole]);
      }

      setFormData({
        name: "",
        location: "",
        responsibilities: "",
        physicalRequirements: "",
        pointOfContact: "",
        contactPhone: ""
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name || "",
      location: role.location || "",
      responsibilities: role.responsibilities || "",
      physicalRequirements: role.physicalRequirements || "",
      pointOfContact: role.pointOfContact || "",
      contactPhone: role.contactPhone || ""
    });
    setEditingId(role._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setRoles((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Manage Volunteer Roles</h1>

      <section className="form-section">
        <form onSubmit={handleSubmit} className="form-section shift-form">
          <h2>{editingId ? "Edit Role" : "Add New Role"}</h2>

          <label htmlFor="name">Role Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label htmlFor="location">Location (optional):</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} />

          <label htmlFor="responsibilities">Responsibilities:</label>
          <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} required />

          <label htmlFor="physicalRequirements">Physical Requirements (optional):</label>
          <textarea name="physicalRequirements" value={formData.physicalRequirements} onChange={handleChange} />

          <label htmlFor="pointOfContact">Point of Contact (Name):</label>
          <input type="text" name="pointOfContact" value={formData.pointOfContact} onChange={handleChange} />

          <label htmlFor="contactPhone">Point of Contact (Phone, optional):</label>
          <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />

          <button type="submit">{editingId ? "💾 Save Changes" : "➕ Add Role"}</button>
        </form>
      </section>

      <section className="form-section">
        <h2>Existing Roles</h2>
        <div className="role-list">
          {roles.map((role) => (
            <div key={role._id} className="role-card">
              <h3>{role.name}</h3>

              <details className="accordion" style={{ marginTop: "10px" }}>
                <summary>📋 View Details</summary>
                <div className="accordion-content">
                  {role.location && (
                    <p><strong>Location:</strong> {role.location}</p>
                  )}
                  {role.responsibilities && (
                    <p><strong>Responsibilities:</strong> {role.responsibilities}</p>
                  )}
                  {role.physicalRequirements && (
                    <p><strong>Physical Requirements:</strong> {role.physicalRequirements}</p>
                  )}
                  {role.pointOfContact && (
                    <p>
                      <strong>Point of Contact:</strong> {role.pointOfContact}
                      {role.contactPhone && (
                        <> (<a href={`tel:${role.contactPhone}`}>{role.contactPhone}</a>)</>
                      )}
                    </p>
                  )}
                </div>
              </details>

              <div className="shift-card-buttons">
                <button type="button" onClick={() => handleEdit(role)}>✏️ Edit</button>
                <button type="button" onClick={() => handleDelete(role._id)}>❌ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
