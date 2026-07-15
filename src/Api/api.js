import axios from "axios";

const API = axios.create({
  baseURL: "https://pharmacy-system-backend-j77b.onrender.com/api",
});

// Automatically inject the token into EVERY request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = "application/json";
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;