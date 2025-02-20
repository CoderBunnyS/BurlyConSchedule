import React, { useState } from "react";
import ClassList from "./components/ClassList";
import AddClassForm from "./components/AddClassForm";

function App() {
  const [classes, setClasses] = useState([]);

  const handleClassAdded = (newClass) => {
    setClasses([...classes, newClass]);
  };

  return (
    <div>
      <h1>Convention Schedule</h1>
      <AddClassForm onClassAdded={handleClassAdded} />
      <ClassList classes={classes} />
    </div>
  );
}

export default App;
