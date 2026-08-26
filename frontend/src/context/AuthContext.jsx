import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    try {

      const storedUser =
        localStorage.getItem("user");

      const token =
        localStorage.getItem("token");

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }

    } catch (error) {

      console.error(
        "Failed to restore authentication:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

    } finally {

      setLoading(false);

    }

  }, []);


  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const token =
      response?.token ||
      response?.data?.token;

    // Handle both flat AuthResponse ({ userId, name, email, role, token }) and nested ({ user: {...} })
    const loggedInUser =
      response?.user ||
      response?.data?.user ||
      (response?.userId || response?.id || token
        ? {
            id: response?.userId ?? response?.id,
            name: response?.name ?? "",
            email: response?.email ?? "",
            role: response?.role ?? "Customer",
          }
        : null);

    if (token) {
      localStorage.setItem("token", token);
    }

    if (loggedInUser) {
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    }

    return response;
  };

  const register = async (userData) => {
    return await registerUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user && localStorage.getItem("token")),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }

  return context;
}

export default AuthContext;
