import React, { useState } from "react";
import "./Login.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.identifier) errs.identifier = "Username or email is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.identifier,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setApiError(data.message || "Login failed");
      } else {
        const data = await res.json();
        login(data.token, data.user); // expects { token, user }
        setForm({ identifier: "", password: "" });
        navigate("/");
      }
    } catch (err) {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Username or Email</label>
          <input
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
          />
          {errors.identifier && <div className="error-message">{errors.identifier}</div>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {apiError && <div className="error-message" style={{ marginTop: 12 }}>{apiError}</div>}
      </form>
      <div className="login-link">
        Don't have an account? <a href="/register">Register</a>
      </div>
    </div>
  );
};

export default Login; 