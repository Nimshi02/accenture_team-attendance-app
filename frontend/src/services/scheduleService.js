import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getSchedule = async (token, weekStart, view = "week") => {
  const response = await axios.get(`${API_BASE_URL}/api/schedule`, {
    ...authHeaders(token),
    params: {
      ...(weekStart ? { week_start: weekStart } : {}),
      view,
    },
  });

  return response.data;
};

export const updateRecurringSchedule = async (
  token,
  schedule,
  weekStart,
  view = "week"
) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/schedule/recurring`,
    {
      schedule,
      view,
      week_start: weekStart,
    },
    authHeaders(token)
  );

  return response.data;
};
