// frontend/src/pages/BuyerDashboard.jsx
import { useEffect, useState } from "react";

export default function BuyerDashboard() {
  const [stats, setStats] = useState({
    ordersPlaced: 0,
    activeOrders: 0,
    completedOrders: 0,
    spent: 0,
  });

  useEffect(() => {
    // 🔹 Later: Replace with API call from backend
    setStats({
      ordersPlaced: 10,
      activeOrders: 2,
      completedOrders: 8,
      spent: 950,
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Buyer Dashboard</h1>
      <p>Track your orders, spending, and activity.</p>

      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        <div>📝 Orders Placed: {stats.ordersPlaced}</div>
        <div>📦 Active Orders: {stats.activeOrders}</div>
        <div>✅ Completed Orders: {stats.completedOrders}</div>
        <div>💸 Total Spent: ${stats.spent}</div>
      </div>
    </div>
  );
}
