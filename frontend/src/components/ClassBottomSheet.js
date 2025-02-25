import React, { useState, useEffect } from "react";
import { Sheet } from "react-modal-sheet";
import { enrollInClass } from "../api";

const ClassBottomSheet = ({ open, onDismiss, classDetails }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("📌 Bottom Sheet Open:", open);
    console.log("📌 Received Class Details:", classDetails);

    setTimeout(() => {
      const container = document.querySelector(".react-modal-sheet-container");
      if (!container) {
        console.warn("⚠️ Bottom sheet container is NOT in the DOM.");
      } else {
        console.log("✅ Bottom sheet container is in the DOM.");

        // 🛠️ Force it to be visible
        container.style.transform = "translateY(0)";
        container.style.visibility = "visible";
        container.style.opacity = "1";
        container.style.zIndex = "9999";
      }
    }, 50); // Short delay to allow rendering
  }, [open, classDetails]);

  const handleEnroll = async () => {
    setLoading(true);
    setMessage("");
    
    const userId = "TEMP_USER_ID"; // 🔹 Replace this when authentication is implemented
    const response = await enrollInClass(classDetails._id, userId);
    
    setLoading(false);
    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage("Successfully enrolled!");
    }
  };

  if (!classDetails) return null;

  return (
    <Sheet isOpen={open} onClose={onDismiss} snapPoints={[0.8, 0.5, 0]}>
      <Sheet.Container className="react-modal-sheet-container bottom-sheet-container">
        <Sheet.Header />
        <Sheet.Content className="bottom-sheet-content">
          <h2>{classDetails.title}</h2>
          <p><strong>Instructor:</strong> {classDetails.instructor}</p>
          <p><strong>Description:</strong> {classDetails.description}</p>
          <p><strong>Capacity:</strong> {classDetails.capacity} students</p>
          <p><strong>Enrolled:</strong> {classDetails.enrolledParticipants?.length || 0}</p>

          {classDetails.enrolledParticipants?.length < classDetails.capacity ? (
            <button onClick={handleEnroll} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          ) : (
            <button disabled>Class Full</button>
          )}

          {message && <p>{message}</p>}

          <button onClick={onDismiss} style={{ marginTop: "10px" }}>Close</button>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onDismiss} />
    </Sheet>
  );
};

export default ClassBottomSheet;
