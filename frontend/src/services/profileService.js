import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getProfile = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/api/profile`, authHeaders(token));

  return response.data;
};

export const updateProfile = async (token, profile) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/profile`,
    profile,
    authHeaders(token)
  );

  return response.data;
};
