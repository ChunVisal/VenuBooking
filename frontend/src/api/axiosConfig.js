import axios from 'axios';

// Create a custom instance of axios with default configurations
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Base URL for the backend API
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;