const axios = require("axios");

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

export const deleteClass = async (classId) => {
  try {
    await axios.delete(`${API_URL}/classes/${classId}`);
  } catch (error) {
    console.error("Error deleting class:", error);
  }
};


// 🔹 New function to enroll a user in a class
export const enrollInClass = async (classId, userId) => {
  try {
    const response = await axios.post(`${API_URL}/classes/${classId}/enroll`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error enrolling in class:", error);
    return { error: error.response?.data?.message || "Enrollment failed" };
  }
};
