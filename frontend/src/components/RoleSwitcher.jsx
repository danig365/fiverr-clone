// frontend/src/components/RoleSwitcher.jsx
import { useEffect, useState } from "react";
import { becomeSeller, switchRole, me } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function RoleSwitcher({ compact = false }) {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isSeller, setIsSeller] = useState(localStorage.getItem("is_seller") === "true");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      me().then(res => {
        const r = res.data.role;
        const sellerFlag = !!res.data.is_seller;
        localStorage.setItem("role", r);
        localStorage.setItem("is_seller", String(sellerFlag));
        setRole(r);
        setIsSeller(sellerFlag);
      }).catch(()=>{});
    }
  }, [role]);

  const enableSeller = async () => {
    setLoading(true);
    try {
      await becomeSeller();
      localStorage.setItem("is_seller", "true");
      setIsSeller(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const doSwitch = async (target) => {
    setLoading(true);
    try {
      if (target === "seller" && !isSeller) {
        // Option A: auto-enable seller capability
        await enableSeller();
      }
      await switchRole(target);
      localStorage.setItem("role", target);
      setRole(target);
      navigate(target === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
    } catch (e) {
      console.error(e);
      // handle error (not seller etc.)
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div>
        <small>Role: {role || "—"}</small>
        {role !== "buyer" && <button onClick={() => doSwitch("buyer")} disabled={loading}>Switch to Buyer</button>}
        {role !== "seller" && <button onClick={() => doSwitch("seller")} disabled={loading}>Switch to Seller</button>}
      </div>
    );
  }

  return (
    <div style={{display:"flex", gap:10, alignItems: "center"}}>
      <div>Current: <strong>{role || "—"}</strong></div>
      <div>
        <button onClick={() => doSwitch("buyer")} disabled={loading || role === "buyer"}>Switch to Buyer</button>
        <button onClick={() => doSwitch("seller")} disabled={loading || role === "seller"}>Switch to Seller</button>
        {!isSeller && <button onClick={enableSeller} disabled={loading}>Become Seller</button>}
      </div>
    </div>
  );
}
