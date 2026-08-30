import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://rag-based-college-chatbot-9um9.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('collegeai_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('collegeai_jwt_token');
    }
    return Promise.reject(error);
  }
);

export default api;
