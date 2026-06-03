import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getNotifications = async (token, category = "all") => {
  const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
    ...authHeaders(token),
    params: { category },
  });

  return response.data;
};

export const getUnreadNotificationCount = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/notifications/unread-count`,
    authHeaders(token)
  );

  return response.data.unread_count;
};

export const markAllNotificationsRead = async (token) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/notifications/read-all`,
    {},
    authHeaders(token)
  );

  return response.data;
};

export const markNotificationRead = async (token, notificationId) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {},
    authHeaders(token)
  );

  return response.data;
};
