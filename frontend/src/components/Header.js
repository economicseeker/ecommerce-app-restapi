import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-logo">E-Commerce</Link>
        <div className="header-links">
          {user ? (
            <>
              <span className="header-user">Welcome!</span>
              <button className="auth-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">Login</Link>
              <Link to="/register" className="header-link">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 