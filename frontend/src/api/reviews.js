// frontend/src/api/reviews.js
import API from "./api";

// Create a new review
export const createReview = (reviewData) => API.post("reviews/", reviewData);

// Get all reviews for a gig
export const getGigReviews = (gigSlug) => API.get(`gigs/${gigSlug}/reviews/`);

// Get review statistics for a gig
export const getGigReviewStats = (gigSlug) => API.get(`gigs/${gigSlug}/reviews/stats/`);

// Check if current user can review a gig
export const canReviewGig = (gigSlug) => API.get(`gigs/${gigSlug}/can-review/`);

// Get user's reviewable orders
export const getReviewableOrders = () => API.get("my-orders/reviewable/");

// Delete a review
export const deleteReview = (reviewId) => API.delete(`reviews/${reviewId}/`);