import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getTodayAttendance = async (token, date) => {
  const response = await axios.get(`${API_BASE_URL}/api/attendance/today`, {
    ...authHeaders(token),
    params: {
      ...(date ? { date } : {}),
    },
  });

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

export const recordAttendance = async (token, attendance) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/attendance`,
    attendance,
    authHeaders(token)
  );

  return response.data;
};
