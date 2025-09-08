import { useEffect, useState } from "react";
import { listGigs } from "../api/gigs";
import { Link } from "react-router-dom";
import "../styles/GigList.css"; // Import the CSS file

export default function GigList() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchGigs = (params = {}) => {
    setLoading(true);
    listGigs(params)
      .then((res) => {
        setGigs(res.data.results || res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs({ search });
  };

  if (loading) return <div className="loading">Loading gigs...</div>;

  return (
    <div className="gig-list-container">
      <h2 className="gig-list-title">Gigs</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search gigs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="search-button" type="submit">Search</button>
      </form>

      {gigs.length === 0 ? (
        <div className="empty-state">
          <h3>No gigs found</h3>
          <p>Try adjusting your search terms or browse all available gigs.</p>
        </div>
      ) : (
        <ul className="gigs-grid">
          {gigs.map((g) => (
            <li key={g.id} className="gig-card">
              <Link className="gig-link" to={`/gigs/${g.slug}`}>
                <div className="gig-content">
                  <h3 className="gig-title">{g.title}</h3>
                  <div className="gig-price-section">
                    <span className="gig-price-label">Starting at</span>
                    <div className="gig-price">${g.price}</div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}