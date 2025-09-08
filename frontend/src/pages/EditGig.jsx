// frontend/src/pages/EditGig.jsx
import { useState, useEffect } from "react";
import { getGig, updateGig } from "../api/gigs";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreateGig.css"; // reuse the same styles

export default function EditGig() {
  const { slug } = useParams();
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

  // Load existing gig details
  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await getGig(slug);
        setForm({
          title: res.data.title,
          description: res.data.description,
          price: res.data.price,
          delivery_time: res.data.delivery_time,
          revisions: res.data.revisions,
        });
      } catch (err) {
        setError("Failed to load gig details");
      }
    };
    fetchGig();
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (thumbnail) data.append("thumbnail", thumbnail);
    try {
      const res = await updateGig(slug, data);
      navigate(`/gigs/${res.data.slug}`);
    } catch (err) {
      setError("Failed to update gig");
    }
  };

  return (
    <div className="create-gig-container">
      <h2 className="create-gig-title">Edit Gig</h2>
      <p className="create-gig-subtitle">
        Update your gig details to keep them fresh
      </p>

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
            <input
              id="title"
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Gig Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              className="form-input form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
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
              <input
                id="price"
                className="form-input form-number"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="5"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="delivery_time">
                Delivery Time (days) <span className="required">*</span>
              </label>
              <input
                id="delivery_time"
                className="form-input form-number"
                type="number"
                name="delivery_time"
                value={form.delivery_time}
                onChange={handleChange}
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
            <input
              id="revisions"
              className="form-input form-number"
              type="number"
              name="revisions"
              value={form.revisions}
              onChange={handleChange}
              min="0"
              max="10"
            />
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="form-section">
          <h3 className="section-title">Gig Gallery</h3>

          <div className="input-group">
            <label className="input-label">Gig Thumbnail</label>
            <div className="file-input-container">
              <input
                className="file-input"
                type="file"
                onChange={(e) => setThumbnail(e.target.files[0])}
                accept="image/*"
              />
              <div
                className={`file-input-label ${thumbnail ? "has-file" : ""}`}
              >
                <span className="file-icon">📁</span>
                <span>
                  {thumbnail
                    ? `Selected: ${thumbnail.name}`
                    : "Click to upload new thumbnail (optional)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="form-section">
          <button className="submit-button" type="submit">
            Update Gig
          </button>
          <p className="submit-note">
            By clicking "Update Gig", you agree to Fiverr's Terms of Service
          </p>
        </div>
      </form>
    </div>
  );
}
