import React from "react";
import { Routes, Route } from "react-router-dom";
import VolunteerShifts from "./components/VolunteerShifts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VolunteerShifts />} />
    </Routes>
  );
}

export default App;
