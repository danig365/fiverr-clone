import React, { useState, useEffect } from 'react';
import { Search, Star, PlayCircle, Users,  ArrowRight } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const categories = [
    { name: 'Graphics & Design', icon: '🎨', popular: true },
    { name: 'Digital Marketing', icon: '📱', popular: true },
    { name: 'Writing & Translation', icon: '✍️', popular: false },
    { name: 'Video & Animation', icon: '🎬', popular: true },
    { name: 'Music & Audio', icon: '🎵', popular: false },
    { name: 'Programming & Tech', icon: '💻', popular: true },
    { name: 'Business', icon: '💼', popular: false },
    { name: 'Lifestyle', icon: '🌟', popular: false },
  ];

  const featuredServices = [
    {
      id: 1,
      title: "I will design a modern logo for your business",
      seller: "sarah_designs",
      rating: 4.9,
      reviews: 1247,
      price: 25,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
      badge: "Best Seller"
    },
    {
      id: 2,
      title: "I will develop a responsive website using React",
      seller: "tech_guru",
      rating: 5.0,
      reviews: 891,
      price: 150,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      badge: "Pro"
    },
    {
      id: 3,
      title: "I will create engaging social media content",
      seller: "content_master",
      rating: 4.8,
      reviews: 2156,
      price: 35,
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop",
      badge: "Rising Star"
    },
    {
      id: 4,
      title: "I will edit your video with professional quality",
      seller: "video_pro",
      rating: 4.9,
      reviews: 743,
      price: 75,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
      badge: "Choice"
    }
  ];

  const testimonials = [
    {
      text: "This platform transformed my business. I found amazing talent that delivered beyond expectations.",
      author: "Jessica Chen",
      role: "Startup Founder",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      text: "As a freelancer, this has been my primary source of income. Great clients and fair payment system.",
      author: "Michael Rodriguez",
      role: "Graphic Designer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    },
    {
      text: "The quality of work I receive here is consistently excellent. Highly recommend!",
      author: "Sarah Johnson",
      role: "Marketing Director",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-title">
                <h1>
                  Find the right
                  <span className="gradient-text"> freelance </span>
                  service, right away
                </h1>
                <p className="hero-subtitle">
                  Millions of people use WorkPlace to turn their ideas into reality. 
                  Join the world's largest marketplace for services.
                </p>
              </div>

              {/* Search Bar */}
              <div className="search-container">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Try 'building mobile app'"
                    className="search-input"
                  />
                  <button className="search-btn">
                    <Search size={20} />
                    Search
                  </button>
                </div>
              </div>

              {/* Popular searches */}
              <div className="popular-tags">
                <span className="popular-label">Popular:</span>
                {['Website Design', 'WordPress', 'Logo Design', 'AI Services'].map((tag) => (
                  <button key={tag} className="tag-btn">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="hero-card-content">
                  <div className="hero-card-header">
                    <PlayCircle size={24} />
                    <span>What is WorkPlace?</span>
                  </div>
                  <p className="hero-card-text">
                    A global marketplace where talented freelancers offer services to ambitious businesses.
                  </p>
                  <div className="hero-card-stats">
                    <div className="stat-item">
                      <Users size={16} />
                      <span>2M+ Sellers</span>
                    </div>
                    <div className="stat-item">
                      <Star size={16} />
                      <span>500M+ Orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="categories-container">
          <div className="section-header">
            <h2 className="section-title">Popular Professional Services</h2>
            <p className="section-subtitle">Get work done in over 500 different categories</p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className={`category-card ${category.popular ? 'popular' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {category.popular && (
                  <div className="popular-badge">Popular</div>
                )}
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="featured-services">
        <div className="featured-container">
          <div className="featured-header">
            <div className="featured-text">
              <h2 className="section-title">Featured Services</h2>
              <p className="section-subtitle">Hand-picked by our team for their exceptional quality</p>
            </div>
            <button className="see-all-btn">
              See All <ArrowRight size={20} />
            </button>
          </div>

          <div className="services-grid">
            {featuredServices.map((service, index) => (
              <div
                key={service.id}
                className="service-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="service-image-container">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="service-image"
                  />
                  <div className="service-badge">{service.badge}</div>
                </div>
                <div className="service-content">
                  <div className="seller-info">
                    <div className="seller-avatar"></div>
                    <span className="seller-name">{service.seller}</span>
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <div className="service-rating">
                    <Star className="star-icon" />
                    <span className="rating-value">{service.rating}</span>
                    <span className="review-count">({service.reviews})</span>
                  </div>
                  <div className="service-price">
                    <span className="price-label">Starting at</span>
                    <span className="price-value">${service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2M+</div>
              <div className="stat-label">Active Sellers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500M+</div>
              <div className="stat-label">Orders Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">190+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-container">
          <h2 className="section-title">What Our Users Say</h2>
          
          <div className="testimonials-slider">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`testimonial ${index === currentTestimonial ? 'active' : ''}`}
              >
                <blockquote className="testimonial-text">
                  "{testimonial.text}"
                </blockquote>
                <div className="testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Join millions of people who use WorkPlace to make their dreams come true.
          </p>
          <div className="cta-buttons">
            <button className="cta-btn-primary">Start Selling</button>
            <button className="cta-btn-secondary">Find Services</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">WorkPlace</div>
              <p className="footer-description">
                The world's largest marketplace for professional services.
              </p>
              <div className="social-links">
                <div className="social-link"></div>
                <div className="social-link"></div>
                <div className="social-link"></div>
              </div>
            </div>
            
            <div className="footer-section">
              <h3 className="footer-title">Categories</h3>
              <div className="footer-links">
                <div className="footer-link">Graphics & Design</div>
                <div className="footer-link">Digital Marketing</div>
                <div className="footer-link">Writing & Translation</div>
                <div className="footer-link">Programming & Tech</div>
              </div>
            </div>
            
            <div className="footer-section">
              <h3 className="footer-title">About</h3>
              <div className="footer-links">
                <div className="footer-link">How it Works</div>
                <div className="footer-link">Privacy Policy</div>
                <div className="footer-link">Terms of Service</div>
                <div className="footer-link">Contact Us</div>
              </div>
            </div>
            
            <div className="footer-section">
              <h3 className="footer-title">Support</h3>
              <div className="footer-links">
                <div className="footer-link">Help Center</div>
                <div className="footer-link">Trust & Safety</div>
                <div className="footer-link">Community</div>
                <div className="footer-link">Blog</div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            © 2025 WorkPlace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;