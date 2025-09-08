// frontend/src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { verifyEmail } from "../api/auth";
import { useSearchParams } from "react-router-dom";
import "../styles/VerifyEmail.css"; // Import the CSS file

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const [msg, setMsg] = useState("verifying...");

  useEffect(() => {
    const token = search.get("token");
    if (!token) {
      setMsg("no token");
      return;
    }
    verifyEmail(token)
      .then(() => setMsg("verified"))
      .catch((e) => setMsg(e?.response?.data || "error"));
  }, [search]);

  const getMessageType = () => {
    if (msg === "verifying...") return "loading";
    if (msg === "verified") return "success";
    if (msg === "no token" || msg === "error") return "error";
    return "error"; // default to error for unknown responses
  };

  const messageType = getMessageType();

  return (
    <div className="verify-email-container">
      <div className="verify-email-wrapper">
        <div className="verify-email-header">
          <h2 className="verify-email-title">Email Verification</h2>
          <p className="verify-email-subtitle">
            {msg === "verifying..." &&
              "Please wait while we verify your email address..."}
            {msg === "verified" && "Your email has been successfully verified!"}
            {(msg === "no token" || msg === "error") &&
              "There was an issue verifying your email address"}
          </p>
        </div>

        <div className="verify-email-card">
          <div className={`verification-status ${messageType}`}>
            <div className="status-icon">
              {messageType === "loading" && (
                <div className="loading-spinner">
                  <svg className="animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
              {messageType === "success" && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {messageType === "error" && (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <div className="status-content">
              <h3 className="status-title">
                {messageType === "loading" && "Verifying your email..."}
                {messageType === "success" && "Email verified successfully!"}
                {messageType === "error" && "Verification failed"}
              </h3>
              <p className="status-message">
                {typeof msg === "string" ? msg : JSON.stringify(msg)}
              </p>
            </div>
          </div>

          {messageType === "success" && (
            <div className="success-actions">
              <button
                type="button"
                className="continue-btn"
                onClick={() => (window.location.href = "/login")}
              >
                Continue to Sign In
              </button>
            </div>
          )}

          {messageType === "error" && (
            <div className="error-actions">
              <div className="action-buttons">
                <button
                  type="button"
                  className="retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="support-btn"
                  onClick={() => (window.location.href = "/support")}
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          <div className="back-section">
            <div className="divider">
              <span className="divider-text">Need to go back?</span>
            </div>
            <button
              type="button"
              className="back-btn"
              onClick={() => (window.location.href = "/login")}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
