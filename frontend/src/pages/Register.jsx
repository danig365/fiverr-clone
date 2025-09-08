// frontend/src/pages/Register.jsx
import { useState } from "react";
import { register } from "../api/auth";
import "../styles/Register.css"; // Import the CSS file

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState("buyer");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await register({ email, username, password, role });
      setMsg("Registered. Check email for verification link.");
    } catch (err) {
      setMsg(err?.response?.data || "error");
    }
  };
  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h2 className="register-title">Join our marketplace</h2>
          <p className="register-subtitle">
            Create your account and start offering your services
          </p>
        </div>

        <div className="register-card">
          <form className="register-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
            <label htmlFor="role" className="form-label">
              I am a
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            <button type="submit" className="register-btn">
              Create Account
            </button>
          </form>

          {msg && (
            <div
              className={`message ${
                msg.includes("Registered") ? "message-success" : "message-error"
              }`}
            >
              <div className="message-content">
                <div className="message-icon">
                  {msg.includes("Registered") ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="message-text">{msg}</p>
              </div>
            </div>
          )}

          <div className="login-section">
            <div className="divider">
              <span className="divider-text">Already have an account?</span>
            </div>
            <button
              type="button"
              className="login-btn"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in to your account
            </button>
          </div>
        </div>

        <div className="register-footer">
          <p className="terms-text">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="terms-link">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="terms-link">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
