import axios from "axios";
import { API_BASE_URL } from "./authService";

const authHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` },
});

export const getWorkLocation = async (token, category = "all") => {
    const response = await axios.get(`${API_BASE_URL}/api/worklocation`, {
        ...authHeaders(token),
        params: { category },
    });

    return response.data;
};