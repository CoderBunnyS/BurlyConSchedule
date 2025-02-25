import React, { useState, useEffect } from "react";
import { getClasses } from "../api";
import ClassBottomSheet from "./ClassBottomSheet";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
    console.log("Clicked class:", cls);
    setSelectedClass(cls);
    setSheetOpen(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Available Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li 
            key={cls._id} 
            onClick={() => handleClassClick(cls)} 
            style={{ cursor: "pointer", marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
            <strong>{cls.title}</strong> - {cls.instructor}
          </li>
        ))}
      </ul>
      <p>Sheet Open: {sheetOpen ? "true" : "false"}</p>
      {/* Bottom Sheet for Class Details */}
      <ClassBottomSheet open={sheetOpen} onDismiss={() => setSheetOpen(false)} classDetails={selectedClass} />
    </div>
  );
};

export default ClassList;
