import React, { useEffect } from "react";
import { Sheet } from "react-modal-sheet";
import "../styles/BottomSheet.css"

const ClassBottomSheet = ({ open, onDismiss, classDetails }) => {
  useEffect(() => {
    console.log("Bottom sheet open:", open);
    console.log("Class details:", classDetails);

    // ✅ Debugging trick: Force visibility
    if (open) {
      document.documentElement.style.overflow = "visible"; // Allows scrolling if necessary
    }
  }, [open, classDetails]);

  if (!classDetails) return null; 

  return (
    <Sheet
      isOpen={open}
      onClose={onDismiss}
      snapPoints={[0.8, 0.5, 0.2]} // Forces it to be higher on the screen
    >
      <Sheet.Container style={{
        background: "white", 
        borderRadius: "15px 15px 0 0", 
        minHeight: "50vh", // ✅ Prevents it from collapsing
        maxHeight: "90vh",
        position: "fixed", // ✅ Ensures it is positioned correctly
        bottom: 0, // ✅ Forces it to stay at the bottom of the screen
        left: 0,
        width: "100%", // ✅ Prevents it from being off-screen
      }}>
        <Sheet.Header />
        <Sheet.Content style={{ padding: "20px" }}>
          <h2>{classDetails.title}</h2>
          <p><strong>Instructor:</strong> {classDetails.instructor}</p>
          <p><strong>Level:</strong> {classDetails.level}</p>
          <p><strong>Description:</strong> {classDetails.description}</p>
          <p><strong>Required Materials:</strong> {classDetails.requiredMaterials || "None"}</p>
          <p><strong>Accessibility:</strong> {classDetails.accessibilityOptions || "Not specified"}</p>
          <p><strong>Capacity:</strong> {classDetails.capacity} students</p>
          <button onClick={onDismiss} style={{ marginTop: "10px" }}>Close</button>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onDismiss} />
    </Sheet>
  );
};

export default ClassBottomSheet;
