import API from "./api";

export const createCheckoutSession = (payload) => {
  return API.post("payments/create-checkout-session/", {
    ...payload,
    success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:5173/payment-cancel",
  });
};

export const verifyPayment = (sessionId) =>
  API.get(`payments/verify/?session_id=${sessionId}`);