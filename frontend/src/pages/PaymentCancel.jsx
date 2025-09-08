export default function PaymentCancel() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>❌ Payment Cancelled</h2>
      <p>You cancelled the payment. No order was charged.</p>
      <a href="/gigs">Back to Gigs</a>
    </div>
  );
}
