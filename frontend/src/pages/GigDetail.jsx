import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGig, deleteGig } from "../api/gigs";
import { createConversation } from "../api/chat";
import { createOrder } from "../api/orders";
import { canReviewGig } from "../api/reviews";
import ReviewsList from "./ReviewList";
import "../styles/GigDetail.css";
import ReviewForm from "./ReviewForm";

export default function GigDetail() {
  const { slug } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGigData = async () => {
      setLoading(true);
      try {
        const gigRes = await getGig(slug);
        setGig(gigRes.data);

        // Check if user can review this gig (only for authenticated buyers)
        const userRole = localStorage.getItem("role");
        const isAuthenticated = localStorage.getItem("access");
        
        if (userRole === "buyer" && isAuthenticated) {
          try {
            const reviewRes = await canReviewGig(slug);
            setCanReview(reviewRes.data.can_review);
            setAvailableOrders(reviewRes.data.reviewable_orders);
          } catch (error) {
            console.error("Error checking review eligibility:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching gig:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigData();
  }, [slug]);

  const handleReviewSubmitted = async () => {
    // Refresh review data after successful submission
    try {
      const reviewRes = await canReviewGig(slug);
      setCanReview(reviewRes.data.can_review);
      setAvailableOrders(reviewRes.data.reviewable_orders);
      
      // Trigger reviews list refresh
      setReviewsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing review data:", error);
    }
  };

  if (loading) {
    return (
      <div className="gig-detail-container">
        <div className="loading-detail">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="gig-detail-container">
        <div className="not-found">
          <div className="not-found-icon">🔍</div>
          <h2 className="not-found-title">Gig Not Found</h2>
          <p className="not-found-description">
            The gig you're looking for doesn't exist or has been removed.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/gigs")}>
            Browse All Gigs
          </button>
        </div>
      </div>
    );
  }

  const handleContactSeller = async () => {
    try {
      const res = await createConversation([gig.seller.id]);
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      alert("Failed to start conversation.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!window.confirm("Place an order for this gig?")) return;

    try {
      const createRes = await createOrder({ gig_id: gig.id, instructions: "" });
      alert("Order placed successfully! You can track it in your Orders page.");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Order placement failed");
    }
  };

  const handleDeleteGig = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this gig? This action cannot be undone."
      )
    )
      return;

    try {
      await deleteGig(gig.slug);
      navigate("/gigs");
    } catch (err) {
      alert("Failed to delete gig. Maybe not owner?");
    }
  };

  const userRole = localStorage.getItem("role");

  return (
    <div className="gig-detail-container">
      <div className="gig-detail-wrapper">
        {/* Breadcrumb */}
        <nav className="gig-breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate("/gigs")}>
            All Gigs
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{gig.title}</span>
        </nav>

        {/* Header */}
        <header className="gig-header">
          <h1 className="gig-detail-title">{gig.title}</h1>
          {gig.seller && (
            <div className="seller-info">
              <div className="seller-avatar">
                {gig.seller.username?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="seller-details">
                <span className="seller-name">
                  By{" "}
                  {gig.seller.username
                    ? gig.seller.username.charAt(0).toUpperCase() +
                      gig.seller.username.slice(1)
                    : "Seller"}
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="gig-detail-layout">
          {/* Left column - Main content */}
          <div className="gig-main-content">
            {gig.thumbnail_url && (
              <div className="gig-image-container">
                <img
                  src={gig.thumbnail_url}
                  alt={gig.title}
                  className="gig-thumbnail"
                />
              </div>
            )}

            <div className="gig-description-section">
              <h2 className="gig-section-title">About This Gig</h2>
              <div className="gig-description-content">
                <p className="gig-description-text">{gig.description}</p>
              </div>
            </div>

            {/* Buyer Actions */}
            {userRole === "buyer" && (
              <div className="buyer-actions">
                <button
                  className="btn btn-secondary btn-contact"
                  onClick={handleContactSeller}
                >
                  <span className="btn-icon">💬</span>
                  Contact Seller
                </button>
              </div>
            )}

            {/* Review Form - Show only if user can review */}
            {canReview && availableOrders.length > 0 && (
              <ReviewForm
                gigId={gig.id}
                availableOrders={availableOrders}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}

            {/* Reviews Section */}
            <ReviewsList 
              gigSlug={gig.slug} 
              refreshTrigger={reviewsRefreshTrigger}
            />
          </div>

          {/* Right sidebar - Pricing */}
          <div className="gig-sidebar">
            <div className="gig-pricing-card">
              <div className="pricing-header">
                <div className="price-container">
                  <span className="price-label">Starting at</span>
                  <div className="price-amount">${gig.price}</div>
                </div>
              </div>

              <div className="gig-features">
                <div className="feature-item">
                  <span className="feature-icon">⏰</span>
                  <div className="feature-content">
                    <span className="feature-label">Delivery Time</span>
                    <span className="feature-value">
                      {gig.delivery_time} days
                    </span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <div className="feature-content">
                    <span className="feature-label">Revisions</span>
                    <span className="feature-value">{gig.revisions}</span>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              {userRole === "buyer" && (
                <div className="order-actions">
                  <button
                    className="btn btn-primary btn-order"
                    onClick={handlePlaceOrder}
                  >
                    Place Order (${gig.price})
                  </button>
                  <p className="order-note">
                    You'll be able to provide additional requirements after
                    placing the order
                  </p>
                </div>
              )}

              {/* Seller Actions */}
              {userRole === "seller" && (
                <div className="seller-actions">
                  <button
                    className="btn btn-primary btn-edit"
                    onClick={() => navigate(`/gigs/${gig.slug}/edit`)}
                  >
                    <span className="btn-icon">✏️</span>
                    Edit Gig
                  </button>
                  <button
                    className="btn btn-danger btn-delete"
                    onClick={handleDeleteGig}
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete Gig
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info Card */}
            <div className="gig-info-card">
              <h3 className="info-card-title">What's Included</h3>
              <ul className="included-features">
                <li className="included-item">
                  <span className="check-icon">✓</span>
                  Professional service delivery
                </li>
                <li className="included-item">
                  <span className="check-icon">✓</span>
                  {gig.revisions} revision{gig.revisions !== 1 ? "s" : ""}{" "}
                  included
                </li>
                <li className="included-item">
                  <span className="check-icon">✓</span>
                  {gig.delivery_time} day delivery
                </li>
                <li className="included-item">
                  <span className="check-icon">✓</span>
                  24/7 customer support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}