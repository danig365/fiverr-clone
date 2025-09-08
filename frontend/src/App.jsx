// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Navbar from "./components/Navbar";
import Orders from "./pages/orders";
// ✅ import new gig pages
import GigList from "./pages/GigList";
import GigDetail from "./pages/GigDetail";
import CreateGig from "./pages/CreateGig";
import EditGig from "./pages/EditGig";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import LandingPage from "./pages/LandingPage";
// ✅ correct chat page imports (match actual filenames)
import Conversations from "./pages/Conversations";
import ConversationDetail from "./pages/ConversationDetail";

function AppContent() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("access");

  // Don't show navbar on login/register/verify
  const hideNavbarPaths = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ];
  const showNavbar = isLoggedIn && !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute roles={["seller"]}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/dashboard"
          element={
            <PrivateRoute roles={["buyer"]}>
              <BuyerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        {/* ✅ Gigs routes */}
        <Route path="/gigs" element={<GigList />} />
        <Route path="/gigs/:slug" element={<GigDetail />} />
        <Route
          path="/gigs/create"
          element={
            <PrivateRoute roles={["seller"]}>
              <CreateGig />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs/:slug/edit"
          element={
            <PrivateRoute roles={["seller"]}>
              <EditGig />
            </PrivateRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* ✅ Chat routes (use the correct component names/files) */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Conversations />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <PrivateRoute>
              <ConversationDetail />
            </PrivateRoute>
          }
        />

        {/* default home page */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
