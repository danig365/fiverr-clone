// frontend/src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

API.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          try {
            const resp = await axios.post(`${API.defaults.baseURL}auth/token/refresh/`, { refresh });
            localStorage.setItem("access", resp.data.access);
            onRefreshed(resp.data.access);
            isRefreshing = false;
            return API(originalRequest);
          } catch (e) {
            isRefreshing = false;
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/login";
            return Promise.reject(e);
          }
        } else {
          window.location.href = "/login";
        }
      }
      return new Promise((resolve, reject) => {
        refreshSubscribers.push(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(API(originalRequest));
        });
      });
    }
    return Promise.reject(err);
  }
);

API.interceptors.request.use(config => {
  const token = localStorage.getItem("access");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default API;
