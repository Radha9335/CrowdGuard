import axios from "axios";

export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "https://crowdguard-backend-py82.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL || `${SERVER_URL}/api`;

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);

export default API;