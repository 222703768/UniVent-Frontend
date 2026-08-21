import axios from "axios";


const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});


client.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("univent_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


client.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response?.status === 401) {
      // Clear the stale session
      sessionStorage.removeItem("univent_token");
      sessionStorage.removeItem("univent_user");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;