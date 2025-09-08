import React, { useEffect, useState } from "react";
import {
  getOrders,
  deliverOrder,
  rejectOrder,
  acceptOrder,
} from "../api/orders";
import { createCheckoutSession } from "../api/payments";
import { loadStripe } from "@stripe/stripe-js";
import "../styles/Orders.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res.data);

        // If your API doesn't return current user, grab it from localStorage or auth context
        const user = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    };
    fetchOrders();
  }, []);

  const handleDeliver = async (orderId) => {
    await deliverOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o))
    );
  };

  const handleReject = async (orderId) => {
    await rejectOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "pending" } : o))
    );
  };

  const handleAccept = async (orderId) => {
    await acceptOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "accepted" } : o))
    );
  };

  const handlePayment = async (orderId) => {
    const res = await createCheckoutSession({ order_id: orderId });
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Your Orders</h1>
        <div className="orders-count">{orders.length} orders</div>
      </div>
      
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead className="orders-thead">
            <tr>
              <th className="orders-th">Gig</th>
              <th className="orders-th">Status</th>
              <th className="orders-th">Actions</th>
            </tr>
          </thead>
          <tbody className="orders-tbody">
            {orders.map((order) => (
              <tr key={order.id} className="orders-row">
                <td className="orders-td gig-title">
                  {order.gig?.title || "Untitled Gig"}
                </td>
                <td className="orders-td">
                  {getStatusBadge(order.status)}
                </td>
                <td className="orders-td actions-cell">
                  {/* Seller delivers */}
                  {order.is_seller && order.status === "pending" && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleDeliver(order.id)}
                    >
                      Deliver
                    </button>
                  )}

                  {/* Buyer accepts or rejects */}
                  {order.is_buyer && order.status === "delivered" && (
                    <div className="button-group">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAccept(order.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleReject(order.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Buyer pays after accepting */}
                  {order.is_buyer && order.status === "accepted" && (
                    <button 
                      className="btn btn-primary btn-pay"
                      onClick={() => handlePayment(order.id)}
                    >
                      Pay Now
                    </button>
                  )}

                  {/* Final completed state */}
                  {order.status === "completed" && (
                    <div className="completed-status">
                      <span className="completed-icon">✓</span>
                      <span className="completed-text">Completed & Paid</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No orders yet</h3>
            <p className="empty-description">Your orders will appear here once you start buying or selling services.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;