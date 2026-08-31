import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT to every request once the user is logged in.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('smcmp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, drop it and send the user back to login.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('smcmp_token');
      localStorage.removeItem('smcmp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
