// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, SetCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      SetCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const checkUser = async () => {
    try {
      const res = await api.get("/auth/me");
      SetCurrentUser(res.data.user);
    } catch (error) {
      SetCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const contextValue = {
    currentUser,
    SetCurrentUser,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Prevent rendering until we know the user's status */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
