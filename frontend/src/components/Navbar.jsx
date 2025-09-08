// frontend/src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { becomeSeller, switchRole, logout, me } from "../api/auth";
import "../styles/Navbar.css";
import Notifications from "./Notifications"; // 👈 import here

export default function Navbar() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [isSeller, setIsSeller] = useState(
    localStorage.getItem("is_seller") === "true"
  );
  const navigate = useNavigate();

  // Ensure sync with backend
  useEffect(() => {
    if (!role) {
      me()
        .then((res) => {
          const r = res.data.role;
          const sellerFlag = !!res.data.is_seller;
          localStorage.setItem("role", r);
          localStorage.setItem("is_seller", String(sellerFlag));
          setRole(r);
          setIsSeller(sellerFlag);
        })
        .catch(() => {});
    }
  }, [role]);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      await logout(refresh);
    } catch (_) {}
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("is_seller");
    navigate("/login");
  };

  const handleBecomeSeller = async () => {
    try {
      await becomeSeller();
      localStorage.setItem("is_seller", "true");
      setIsSeller(true);
      alert("You are now a seller! Switch role to start selling.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchRole = async (target) => {
    try {
      await switchRole(target);
      localStorage.setItem("role", target);
      setRole(target);
      if (target === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/buyer/dashboard");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side - Brand and Navigation */}
        <div className="navbar-left">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              FreelanceHub
            </Link>
          </div>

          <div className="navbar-nav">
            <Link to="/gigs" className="nav-link">
              Browse Gigs
            </Link>
            {role === "seller" && (
              <Link to="/gigs/create" className="nav-link">
                Create Gig
              </Link>
            )}
            <Link to="/chat" className="nav-link">
              Messages
            </Link>
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
          </div>
        </div>

        {/* Right side - User Actions */}
        <div className="navbar-right">
          <Notifications />
          <div className="action-buttons">
            {role !== "buyer" && (
              <button
                onClick={() => handleSwitchRole("buyer")}
                className="btn btn-outline"
              >
                Switch to Buyer
              </button>
            )}
            {role !== "seller" && isSeller && (
              <button
                onClick={() => handleSwitchRole("seller")}
                className="btn btn-outline"
              >
                Switch to Seller
              </button>
            )}
            {!isSeller && (
              <button onClick={handleBecomeSeller} className="btn btn-primary">
                Become Seller
              </button>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
