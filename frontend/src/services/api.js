import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5003/api";

const api =
  axios.create({
    baseURL:
      API_BASE_URL,
  });

api.interceptors.request.use(
  config => {
    const token =
      localStorage.getItem(
        "token"
      ) ||
      localStorage.getItem(
        "authToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  error =>
    Promise.reject(
      error
    )
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
