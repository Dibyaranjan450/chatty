import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SOCKET_BASE_URL}/api`,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  withCredentials: true,
});
