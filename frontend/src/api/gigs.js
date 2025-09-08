// frontend/src/api/gigs.js
import API from "./api";

// Public list gigs (paginated)
export const listGigs = (params = {}) => API.get("gigs/", { params });

// Public retrieve gig detail by slug
export const getGig = (slug) => API.get(`gigs/${slug}/`);

// Seller: create gig (multipart FormData)
export const createGig = (data) =>
  API.post("gigs/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Seller: update gig (multipart, slug)
export const updateGig = (slug, data) =>
  API.patch(`gigs/${slug}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Seller: delete gig
export const deleteGig = (slug) => API.delete(`gigs/${slug}/`);

// Seller: upload extra image to gig
export const uploadGigImage = (slug, data) =>
  API.post(`gigs/${slug}/upload_image/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Public: list gigs by seller id
export const listGigsBySeller = (sellerId) =>
  API.get(`gigs/by-seller/${sellerId}/`);
