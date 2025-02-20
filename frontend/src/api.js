import axios from "axios";

const API_URL = "http://localhost:5001/api"; // Update when deployed

export const getClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/classes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

export const addClass = async (classData) => {
    try {
      const response = await axios.post(`${API_URL}/classes`, classData);
      return response.data;
    } catch (error) {
      console.error("Error adding class:", error);
      return null;
    }
  };
  
