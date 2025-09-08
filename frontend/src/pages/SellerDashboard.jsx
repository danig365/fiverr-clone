// frontend/src/pages/SellerDashboard.jsx
import { useEffect, useState } from "react";

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    gigs: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    // 🔹 Later: Replace with API call from backend
    setStats({
      gigs: 3,
      activeOrders: 5,
      completedOrders: 12,
      revenue: 1500,
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Seller Dashboard</h1>
      <p>Manage your gigs, track orders, and view earnings.</p>

      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        <div>🛠 Total Gigs: {stats.gigs}</div>
        <div>📦 Active Orders: {stats.activeOrders}</div>
        <div>✅ Completed Orders: {stats.completedOrders}</div>
        <div>💰 Total Revenue: ${stats.revenue}</div>
      </div>
    </div>
  );
}
