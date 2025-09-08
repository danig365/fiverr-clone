import { useState } from "react";
import { createReview } from "../api/reviews";
// import "../styles/ReviewForm.css";
import './ReviewForm.css';

export default function ReviewForm({ gigId, availableOrders, onReviewSubmitted }) {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

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
        comment: comment.trim()
      });
      
      // Reset form
      setSelectedOrder("");
      setRating(5);
      setComment("");
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMsg = error?.response?.data?.detail || 
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
          className={`star-btn ${i <= currentRating ? 'active' : ''}`}
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

  return (
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
            {availableOrders.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - ${order.price} ({new Date(order.created_at).toLocaleDateString()})
              </option>
            ))}
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
          className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}