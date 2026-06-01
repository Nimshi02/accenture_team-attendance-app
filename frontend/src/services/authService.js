import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const sessionKey = "teamAttendanceAuth";

export { API_BASE_URL };

export const getStoredSession = () => {
  const storedSession = localStorage.getItem(sessionKey);
  return storedSession ? JSON.parse(storedSession) : null;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  localStorage.setItem(sessionKey, JSON.stringify(response.data));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem(sessionKey);
};
