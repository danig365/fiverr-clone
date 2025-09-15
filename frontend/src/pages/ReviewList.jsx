import { useState, useEffect } from "react";
import { createReview, getGigReviews } from "../api/reviews";
import "./ReviewForm.css";
import "./ReviewList.css";

export default function ReviewFormWithList({
  gigId,
  gigSlug,
  availableOrders,
}) {
  // Form states
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!gigSlug) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getGigReviews(gigSlug);
        setReviews(response.data);
      } catch (err) {
        setError("Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [gigSlug, refreshTrigger]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder) {
      alert("Please select an order to review");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        gig: gigId,
        order: parseInt(selectedOrder),
        rating,
        comment: comment.trim(),
      });

      // Reset form
      setSelectedOrder("");
      setRating(5);
      setComment("");

      // Refresh reviews
      setRefreshTrigger((prev) => prev + 1);

      alert("Review submitted successfully!");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        "Failed to submit review";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const currentRating = hoveredRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= currentRating ? "active" : ""}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  // Helper function to render review stars
  const renderReviewStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Helper function to get user initials
  const getUserInitials = (username) => {
    if (!username) return "U";
    const names = username.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="review-section">
      {/* Review Form */}
      <div className="review-form-container">
        <h3 className="review-form-title">Write a Review</h3>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Order Selection */}
          <div className="form-group">
            <label className="form-label">Select Order:</label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Choose an order to review...</option>
              {availableOrders && availableOrders.length > 0 ? (
                availableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - ${order.price} (
                    {new Date(order.created_at).toLocaleDateString()})
                  </option>
                ))
              ) : (
                <option disabled>No available orders</option>
              )}
            </select>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label className="form-label">Rating:</label>
            <div className="star-rating">
              {renderStars()}
              <span className="rating-text">{rating} out of 5 stars</span>
            </div>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">Your Review:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this gig..."
              rows={4}
              required
              maxLength={1000}
              className="form-textarea"
            />
            <small className="char-count">{comment.length}/1000 characters</small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="reviews-section">
        <h3 className="reviews-title">All Reviews</h3>

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews found</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {getUserInitials(review.reviewer_username)}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name">{review.reviewer_username}</div>
                      <div className="review-date">
                        {formatDate(review.created_at || review.date)}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderReviewStars(review.rating)}
                  </div>
                </div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}