import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api.service";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.error(
            "Init auth - Failed to validate token, removing:",
            error
          );
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      // Token is already saved in localStorage by authService.login
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (profileError) {
          console.error("Failed to fetch profile:", profileError);
        }
        return { success: true };
      } else {
        throw new Error("Token not saved");
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      // Token is already saved in localStorage by authService.register
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (profileError) {
          console.error("Failed to fetch profile:", profileError);
        }
        return { success: true };
      } else {
        throw new Error("Token not saved");
      }
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
