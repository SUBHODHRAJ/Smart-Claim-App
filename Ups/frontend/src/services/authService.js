import api from "./api";

const AUTH_BASE = "/Auth";


export async function loginUser(credentials) {

  const response = await api.post(
    `${AUTH_BASE}/login`,
    credentials
  );

  return response.data;
}


export async function registerUser(userData) {
  const payload = {
    name: (userData?.name || userData?.fullName || "").trim(),
    email: (userData?.email || "").trim(),
    password: userData?.password || "",
  };

  const response = await api.post(
    `${AUTH_BASE}/register`,
    payload
  );

  return response.data;
}


export async function getCurrentUser() {

  const response = await api.get(
    `${AUTH_BASE}/me`
  );

  return response.data;
}


export async function logoutUser() {

  // JWT authentication is stateless.
  // Removing the local token is sufficient.
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}


const authService = {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
};

export default authService;
