import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirements: ""
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

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const newRole = await res.json();

      if (editingId) {
        setRoles((prev) => prev.map((r) => (r._id === editingId ? newRole : r)));
      } else {
        setRoles((prev) => [...prev, newRole]);
      }
      setFormData({ name: "", description: "", requirements: "" });
      setEditingId(null);
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
      requirements: role.requirements || ""
    });
    setEditingId(role._id);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this role?");
    if (!confirm) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles/${id}`, {
        method: "DELETE"
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

      <form onSubmit={handleSubmit} className="role-form">
        <h2>{editingId ? "Edit Role" : "Add New Role"}</h2>

        <label htmlFor="name">Role Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="description">Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label htmlFor="requirements">Requirements (optional):</label>
        <textarea name="requirements" value={formData.requirements} onChange={handleChange} />

        <button type="submit">{editingId ? "💾 Save Changes" : "➕ Add Role"}</button>
      </form>

      <div className="role-list">
        {roles.map((role) => (
          <div key={role._id} className="role-card">
            <h3>{role.name}</h3>
            <p><strong>Description:</strong> {role.description}</p>
            {role.requirements && <p><strong>Requirements:</strong> {role.requirements}</p>}

            <div className="shift-card-buttons">
              <button type="button" onClick={() => handleEdit(role)}>✏️ Edit</button>
              <button type="button" onClick={() => handleDelete(role._id)}>❌ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
