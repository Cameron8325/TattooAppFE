// src/context/authContext.js
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, login as loginService, logout as logoutService } from "../services/authService";

// Create the context
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Stores user data, including role
  const [loading, setLoading] = useState(true); // Useful to show a loader until we know the auth state

  // Function to fetch and set the user when the app loads or after login
  const fetchUser = async () => {
    try {
      const { data } = await getUser();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Updated login function: Fetches user after login, updating Navbar immediately
  const login = async (credentials) => {
    try {
      await loginService(credentials); // Calls the backend login
      const { data } = await getUser(); // Fetch updated user data
      setUser(data); // ✅ Immediately update the user state
      return data; // ✅ Return user data
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Wrapper for logout: Calls the backend and then resets state
  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
