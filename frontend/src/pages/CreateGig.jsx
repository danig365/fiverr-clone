// frontend/src/pages/CreateGig.jsx
import { useState } from "react";
import { createGig } from "../api/gigs";
import { useNavigate } from "react-router-dom";
import "../styles/CreateGig.css"; // Import the CSS file

export default function CreateGig() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    delivery_time: 1,
    revisions: 0,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (thumbnail) data.append("thumbnail", thumbnail);
    try {
      const res = await createGig(data);
      navigate(`/gigs/${res.data.slug}`);
    } catch (err) {
      setError("Failed to create gig");
    }
  };

  return (
    <div className="create-gig-container">
      <h2 className="create-gig-title">Create Gig</h2>
      <p className="create-gig-subtitle">Share your skills with the world and start earning</p>
      
      <div className="form-progress"></div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="create-gig-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="input-group">
            <label className="input-label" htmlFor="title">
              Gig Title <span className="required">*</span>
            </label>
            <p className="input-description">
              Write a clear, descriptive title for your gig that explains what you'll deliver
            </p>
            <input
              id="title"
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="I will design a professional logo for your business"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Gig Description <span className="required">*</span>
            </label>
            <p className="input-description">
              Describe your service in detail. What will you deliver? What makes you unique?
            </p>
            <textarea
              id="description"
              className="form-input form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your gig in detail. Include your experience, what's included, and what makes your service special..."
              required
            />
          </div>
        </div>

        {/* Pricing & Delivery Section */}
        <div className="form-section">
          <h3 className="section-title">Pricing & Delivery</h3>
          
          <div className="input-row">
            <div className="input-group">
              <label className="input-label" htmlFor="price">
                Price (USD) <span className="required">*</span>
              </label>
              <p className="input-description">
                Set your starting price
              </p>
              <input
                id="price"
                className="form-input form-number"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="25"
                min="5"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="delivery_time">
                Delivery Time (days) <span className="required">*</span>
              </label>
              <p className="input-description">
                How long will it take to complete?
              </p>
              <input
                id="delivery_time"
                className="form-input form-number"
                type="number"
                name="delivery_time"
                value={form.delivery_time}
                onChange={handleChange}
                placeholder="3"
                min="1"
                max="365"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="revisions">
              Number of Revisions
            </label>
            <p className="input-description">
              How many revisions will you include? (0 for no revisions)
            </p>
            <input
              id="revisions"
              className="form-input form-number"
              type="number"
              name="revisions"
              value={form.revisions}
              onChange={handleChange}
              placeholder="2"
              min="0"
              max="10"
            />
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="form-section">
          <h3 className="section-title">Gig Gallery</h3>
          
          <div className="input-group">
            <label className="input-label">
              Gig Thumbnail
            </label>
            <p className="input-description">
              Upload a high-quality image that represents your gig (JPG, PNG, max 5MB)
            </p>
            <div className="file-input-container">
              <input
                className="file-input"
                type="file"
                onChange={(e) => setThumbnail(e.target.files[0])}
                accept="image/*"
              />
              <div className={`file-input-label ${thumbnail ? 'has-file' : ''}`}>
                <span className="file-icon">📁</span>
                <span>
                  {thumbnail ? `Selected: ${thumbnail.name}` : 'Click to upload thumbnail image'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="form-section">
          <button className="submit-button" type="submit">
            Create Gig
          </button>
          <p className="submit-note">
            By clicking "Create Gig", you agree to Fiverr's Terms of Service
          </p>
        </div>
      </form>
    </div>
  );
}