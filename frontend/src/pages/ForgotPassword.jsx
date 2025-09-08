// frontend/src/pages/ForgotPassword.jsx
import { useState } from "react";
import { requestPasswordReset } from "../api/auth";
import "../styles/ForgotPassword.css"; // Import the CSS file

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      const r = await requestPasswordReset({ email });
      setMsg(r.data);
    } catch (e) {
      setMsg("error");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Reset your password</h2>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="forgot-password-card">
          <form className="forgot-password-form" onSubmit={submit}>
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
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="send-btn">
              Send Reset Link
            </button>
          </form>

          {msg && (
            <div className={`message ${msg === "error" ? "message-error" : "message-success"}`}>
              <div className="message-content">
                <div className="message-icon">
                  {msg === "error" ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="message-text">
                  {typeof msg === "string" ? msg : JSON.stringify(msg)}
                </p>
              </div>
            </div>
          )}

          <div className="back-to-login-section">
            <div className="divider">
              <span className="divider-text">Remember your password?</span>
            </div>
            <button 
              type="button" 
              className="back-to-login-btn"
              onClick={() => window.location.href = '/login'}
            >
              Back to Sign In
            </button>
          </div>
        </div>

        <div className="forgot-password-footer">
          <p className="help-text">
            Need help? Contact our{" "}
            <a href="/support" className="help-link">Support Team</a>
          </p>
        </div>
      </div>
    </div>
  );
}