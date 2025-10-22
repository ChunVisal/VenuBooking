import axios from 'axios';

// Create a custom instance of axios with default configurations
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Base URL for the backend API
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export default api;