import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyPayment } from "../api/payments";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function checkPayment() {
      if (!sessionId) return;

      try {
        const res = await verifyPayment(sessionId);
        if (res.data.payment_status === "paid" || res.data.payment_status === "succeeded") {
          setVerified(true);
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
      } finally {
        setLoading(false);
      }
    }

    checkPayment();
  }, [sessionId]);

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Verifying payment...</h3>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {verified ? (
        <>
          <h2>✅ Payment Successful!</h2>
          <p>Thank you for your purchase.</p>
          <p>
            <strong>Stripe Session ID:</strong> {sessionId}
          </p>
          <Link to="/buyer-dashboard">Go to Dashboard</Link>
        </>
      ) : (
        <>
          <h2>❌ Payment Not Verified</h2>
          <p>Please contact support if you believe this is an error.</p>
          <Link to="/buyer-dashboard">Back to Dashboard</Link>
        </>
      )}
    </div>
  );
}
