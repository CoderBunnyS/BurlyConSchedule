import React, { useState, useEffect } from "react";
import { getClasses } from "../api";
import { useNavigate } from "react-router-dom"; // 🚀 For navigation
import "../styles/global.css"; // ✅ Global styles
import "../styles/MainPage.css"; // ✅ Main page styles
import "../styles/BottomSheet.css"
import ClassBottomSheet from "./ClassBottomSheet"


const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate(); // 🚀 Used for navigation

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (err) {
        setError("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    setSheetOpen(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Available Classes</h2>

      {/* 🚀 Admin & Volunteer Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/admin")} style={buttonStyle}>
          Admin Panel
        </button>
        <button onClick={() => navigate("/volunteer")} style={buttonStyle}>
          Volunteer Shifts
        </button>
      </div>

      {/* List of Classes */}
      <ul>
        {classes.map((cls) => (
          <li 
            key={cls._id} 
            onClick={() => handleClassClick(cls)} 
            style={classItemStyle}>
            <strong>{cls.title}</strong> - {cls.instructor}
          </li>
        ))}
      </ul>

      {/* Bottom Sheet for Class Details */}
      <ClassBottomSheet open={sheetOpen} onDismiss={() => setSheetOpen(false)} classDetails={selectedClass} />
    </div>
  );
};

/* 🔹 Styling */
const buttonStyle = {
  padding: "10px 15px",
  margin: "5px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const classItemStyle = {
  cursor: "pointer",
  marginBottom: "10px",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px"
};

export default ClassList;
