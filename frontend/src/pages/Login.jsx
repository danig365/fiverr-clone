// frontend/src/pages/Login.jsx
import { me } from "../api/auth";
import { useState } from "react";
import { login } from "../api/auth";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const submit = async (e) => {
  e.preventDefault();
  try {
    // login -> get tokens
    const resp = await login({ email, password });
    localStorage.setItem("access", resp.data.access);
    localStorage.setItem("refresh", resp.data.refresh);

    // fetch user details
    const meResp = await me();
    localStorage.setItem("username", meResp.data.username);
    localStorage.setItem("userId", meResp.data.id);
    localStorage.setItem("role", meResp.data.role);
    localStorage.setItem("is_seller", String(meResp.data.is_seller || false));

    // redirect by role
    if (meResp.data.role === "seller") {
      window.location.href = "/seller/dashboard";
    } else {
      window.location.href = "/buyer/dashboard";
    }
  } catch (e) {
    setErr(e?.response?.data || "error");
  }
};

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <div className="login-card">
          <form className="login-form" onSubmit={submit}>
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
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => (window.location.href = "/forgot-password")}
          >
            Forgot Password?
          </button>

          {err && (
            <div className="message message-error">
              <div className="message-content">
                <div className="message-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="message-text">
                  {typeof err === "string" ? err : JSON.stringify(err)}
                </p>
              </div>
            </div>
          )}

          <div className="register-section">
            <div className="divider">
              <span className="divider-text">Don't have an account?</span>
            </div>
            <button
              type="button"
              className="register-btn"
              onClick={() => (window.location.href = "/register")}
            >
              Create new account
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p className="terms-text">
            By signing in, you agree to our{" "}
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
