import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, DollarSign, Image, FileText } from 'lucide-react';
import EventCard from './EventCard';

const CATEGORIES = ['Technology', 'Entertainment', 'Arts & Culture', 'Food & Drink', 'Sports', 'Business'];

const PRESET_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', label: 'Tech / Conference' },
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', label: 'Music Festival' },
  { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', label: 'Art Expo' },
  { url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', label: 'Food & Culinary' },
  { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', label: 'Business Seminar' }
];

const EventCreationForm = ({ onEventCreated }) => {
  const [organizer, setOrganizer] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_organizer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authTab, setAuthTab] = useState('signin');
  const [authForm, setAuthForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const usersStr = localStorage.getItem('aura_organizers') || '[]';
    let users = [];
    try {
      users = JSON.parse(usersStr);
    } catch (err) {
      users = [];
    }

    if (authTab === 'signup') {
      const { name, company, email, password, confirmPassword } = authForm;
      if (!name || !company || !email || !password) {
        setAuthError('All fields are required.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setAuthError('An organizer with this email is already registered.');
        return;
      }

      const newOrg = { name, company, email: email.toLowerCase(), password };
      users.push(newOrg);
      localStorage.setItem('aura_organizers', JSON.stringify(users));
      localStorage.setItem('aura_organizer', JSON.stringify(newOrg));
      setOrganizer(newOrg);
      setAuthSuccess('Registration successful! Form unlocked.');
    } else {
      const { email, password } = authForm;
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (found) {
        localStorage.setItem('aura_organizer', JSON.stringify(found));
        setOrganizer(found);
        setAuthSuccess('Logged in successfully!');
      } else {
        setAuthError('Invalid email or password.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_organizer');
    setOrganizer(null);
    setAuthForm({
      name: '',
      company: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    category: 'Technology',
    capacity: '',
    imageUrl: PRESET_IMAGES[0].url
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectImage = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Frontend validations
    if (Number(formData.price) < 0) {
      setError('Price cannot be negative.');
      setLoading(false);
      return;
    }
    if (Number(formData.capacity) <= 0) {
      setError('Capacity must be greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          capacity: Number(formData.capacity)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        category: 'Technology',
        capacity: '',
        imageUrl: PRESET_IMAGES[0].url
      });
      
      if (onEventCreated) {
        // Trigger parent callback after a brief success delay
        setTimeout(() => {
          onEventCreated(data);
        }, 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Build live preview object
  const previewEvent = {
    ...formData,
    price: formData.price === '' ? 0 : Number(formData.price),
    capacity: formData.capacity === '' ? 100 : Number(formData.capacity),
    bookedTickets: 0
  };

  if (!organizer) {
    return (
      <div className="auth-gate-container">
        <div className="glass-card auth-card">
          <div className="auth-header">
            <Sparkles size={28} className="header-icon" />
            <h2>Organizer Portal</h2>
            <p>Please register or sign in to configure and publish new events.</p>
          </div>

          <div className="auth-tabs">
            <button
              onClick={() => { setAuthTab('signin'); setAuthError(null); setAuthSuccess(null); }}
              className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab('signup'); setAuthError(null); setAuthSuccess(null); }}
              className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
            >
              Register
            </button>
          </div>

          {authError && <div className="alert alert-danger">{authError}</div>}
          {authSuccess && <div className="alert alert-success">{authSuccess}</div>}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authTab === 'signup' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Organization</label>
                  <input
                    type="text"
                    name="company"
                    required
                    placeholder="e.g. TechNexus Media Corp"
                    value={authForm.company}
                    onChange={handleAuthChange}
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="org@example.com"
                value={authForm.email}
                onChange={handleAuthChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={authForm.password}
                onChange={handleAuthChange}
                className="form-control"
              />
            </div>

            {authTab === 'signup' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={authForm.confirmPassword}
                  onChange={handleAuthChange}
                  className="form-control"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit-btn">
              {authTab === 'signup' ? 'Create Organizer Account' : 'Sign In'}
            </button>
          </form>
        </div>
        <style>{`
          .auth-gate-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
            width: 100%;
          }
          .auth-card {
            width: 100%;
            max-width: 450px;
            padding: 32px;
          }
          .auth-header {
            text-align: center;
            margin-bottom: 24px;
          }
          .auth-header h2 {
            margin-top: 10px;
            font-size: 1.6rem;
          }
          .auth-header p {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 6px;
          }
          .auth-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }
          .auth-tab-btn {
            padding: 10px;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border-glass);
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: var(--transition-normal);
          }
          .auth-tab-btn.active {
            background: var(--bg-surface-elevated);
            border-color: var(--color-primary);
            color: white;
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.1);
          }
          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .auth-submit-btn {
            margin-top: 10px;
            padding: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="creation-layout">
      {/* Form Section */}
      <div className="glass-card form-section-card">
        <div className="section-header">
          <Sparkles className="header-icon" />
          <div className="header-meta-flex">
            <div>
              <h2>Create New Event</h2>
              <p>Publish an industry-grade event passes structure instantly.</p>
            </div>
            <div className="organizer-profile-badge">
              <span className="profile-text">Organizer: <strong>{organizer.name}</strong> ({organizer.company})</span>
              <button type="button" onClick={handleLogout} className="btn-logout">Sign Out</button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">✨ Event published successfully! Redirecting...</div>}

        <form onSubmit={handleSubmit} className="creation-form">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Future of Artificial Intelligence Symposium"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-selector">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={`category-chip ${formData.category === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              required
              rows="3"
              placeholder="Detailed description of what attendees will learn or experience..."
              value={formData.description}
              onChange={handleChange}
              className="form-control text-area"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue Location</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Moscone Center, San Francisco"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ticket Price ($)</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                placeholder="0 for free"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Capacity</label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                placeholder="Maximum attendees"
                value={formData.capacity}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image Banner</label>
            <div className="image-presets-grid">
              {PRESET_IMAGES.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectImage(img.url)}
                  className={`preset-thumbnail ${formData.imageUrl === img.url ? 'active' : ''}`}
                >
                  <img src={img.url} alt={img.label} />
                  <span className="preset-label">{img.label}</span>
                </div>
              ))}
            </div>
            <div className="custom-url-wrapper">
              <span className="or-divider">Or enter custom image URL</span>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary submit-btn" 
            disabled={loading}
          >
            {loading ? 'Publishing Event...' : 'Publish Event'}
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <h3 className="preview-heading">Card Preview</h3>
        <div className="preview-card-holder">
          <EventCard event={previewEvent} onBook={() => {}} />
        </div>
      </div>

      <style>{`
        .creation-layout {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: start;
        }

        .form-section-card {
          padding: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
        }

        .header-icon {
          color: var(--color-primary);
          width: 32px;
          height: 32px;
        }

        .creation-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }

        .alert-danger {
          background: var(--color-danger-bg);
          color: var(--color-danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .alert-success {
          background: var(--color-success-bg);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .category-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          padding: 8px 16px;
          border-radius: 99px;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .category-chip:hover {
          color: var(--text-primary);
          border-color: var(--color-primary);
        }

        .category-chip.active {
          background: var(--gradient-primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .text-area {
          resize: vertical;
        }

        .image-presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
          margin-top: 4px;
        }

        .preset-thumbnail {
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          aspect-ratio: 4/3;
          position: relative;
          transition: var(--transition-fast);
        }

        .preset-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preset-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(10, 7, 18, 0.85);
          font-size: 0.65rem;
          padding: 4px;
          text-align: center;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .preset-thumbnail:hover {
          transform: scale(1.02);
        }

        .preset-thumbnail.active {
          border-color: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary);
        }

        .custom-url-wrapper {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .or-divider {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .submit-btn {
          margin-top: 16px;
          padding: 16px;
          font-size: 1rem;
        }

        .preview-section {
          position: sticky;
          top: 100px;
        }

        .preview-heading {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preview-card-holder {
          pointer-events: none;
        }

        .header-meta-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 16px;
        }

        .organizer-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.12);
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 0.75rem;
        }

        .profile-text {
          color: var(--text-secondary);
        }

        .profile-text strong {
          color: white;
        }

        .btn-logout {
          background: var(--color-danger-bg);
          color: var(--color-danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 4px 10px;
          border-radius: 99px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.7rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-logout:hover {
          background: var(--color-danger);
          color: white;
        }

        @media (max-width: 900px) {
          .creation-layout {
            grid-template-columns: 1fr;
          }
          .preview-section {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCreationForm;
