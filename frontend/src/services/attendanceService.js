import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getTodayAttendance = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/attendance/today`,
    authHeaders(token)
  );

  return response.data;
};

export const getAttendanceSummary = async (token, weekStart) => {
  const response = await axios.get(`${API_BASE_URL}/api/attendance/summary`, {
    ...authHeaders(token),
    params: {
      ...(weekStart ? { week_start: weekStart } : {}),
    },
  });

  return response.data;
};
