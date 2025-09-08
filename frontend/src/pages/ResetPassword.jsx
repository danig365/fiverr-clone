// frontend/src/pages/ResetPassword.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";
import "../styles/ResetPassword.css"; // Import the CSS file

export default function ResetPassword() {
  const [search] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async e => {
    e.preventDefault();
    const token = search.get("token");
    try {
      const r = await confirmPasswordReset({ token, new_password: newPassword });
      setMsg(r.data);
    } catch (e) {
      setMsg(e?.response?.data || "error");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-wrapper">
        <div className="reset-password-header">
          <h2 className="reset-password-title">Set new password</h2>
          <p className="reset-password-subtitle">
            Enter your new password below to complete the reset process
          </p>
        </div>

        <div className="reset-password-card">
          <form className="reset-password-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Enter your new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="form-input"
              />
              <p className="form-hint">
                Choose a strong password with at least 8 characters
              </p>
            </div>

            <button type="submit" className="set-password-btn">
              Set New Password
            </button>
          </form>

          {msg && (
            <div className={`message ${msg === "error" ? "message-error" : "message-success"}`}>
              <div className="message-content">
                <div className="message-icon">
                  {msg === "error" ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              <span className="divider-text">Password reset complete?</span>
            </div>
            <button 
              type="button" 
              className="back-to-login-btn"
              onClick={() => window.location.href = '/login'}
            >
              Sign in with new password
            </button>
          </div>
        </div>

        <div className="reset-password-footer">
          <p className="help-text">
            Having trouble? Contact our{" "}
            <a href="/support" className="help-link">Support Team</a>
          </p>
        </div>
      </div>
    </div>
  );
}