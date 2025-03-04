import React, { useState, useEffect } from "react";
import { getClasses, deleteClass } from "../api";
import { useNavigate } from "react-router-dom";
//import "../styles/AdminPanel.css";

const AdminPanel = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (err) {
        setError("Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(classId);
        setClasses(classes.filter((cls) => cls._id !== classId));
      } catch (err) {
        alert("Failed to delete class.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <button onClick={() => navigate("/admin/add-class")}>Add New Class</button>

      <ul>
        {classes.map((cls) => (
          <li key={cls._id} className="admin-class-item">
            <strong>{cls.title}</strong> - {cls.instructor}
            <button onClick={() => navigate(`/admin/edit/${cls._id}`)}>Edit</button>
            <button onClick={() => handleDelete(cls._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
