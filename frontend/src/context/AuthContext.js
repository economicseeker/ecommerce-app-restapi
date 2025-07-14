import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // Optionally fetch user info with token
      setUser({}); // Placeholder, replace with real user fetch if needed
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (token, userInfo) => {
    setToken(token);
    localStorage.setItem("token", token);
    setUser(userInfo || {});
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 