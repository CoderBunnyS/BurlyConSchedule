import axios from "axios";

const API_URL = "http://localhost:6000/api"; // Update when deployed

export const getClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/classes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};
