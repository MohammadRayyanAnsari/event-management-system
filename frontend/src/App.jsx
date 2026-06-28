import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import EventCreationForm from './components/EventCreationForm';
import TicketBookingModal from './components/TicketBookingModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import QRScanner from './components/QRScanner';
import MyTickets from './components/MyTickets';
import { Search, SlidersHorizontal, RefreshCw, AlertTriangle, Layers, CalendarRange } from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Entertainment', 'Arts & Culture', 'Food & Drink', 'Sports', 'Business'];

function App() {
  const [view, setView] = useState('events'); // 'events', 'create', 'analytics', 'scanner', 'tickets'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected event for booking
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to load events catalog.');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBookingSuccess = (email) => {
    setUserEmail(email);
    // Refresh catalog (decrements ticket availability in cards)
    fetchEvents();
  };

  const handleEventCreated = () => {
    fetchEvents();
    setView('events');
  };

  // Filtered Events
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Background Decorative Glow */}
      <div className="bg-glow-layer" />

      {/* Main Glass Header/Navbar */}
      <Navbar 
        currentView={view} 
        onViewChange={(v) => { setView(v); setError(null); }} 
        userEmail={userEmail}
      />

      {/* Main Content Area */}
      <main className="app-main-content">
        
        {/* VIEW 1: Discover / Events Portal */}
        {view === 'events' && (
          <div className="events-view-container">
            {/* Hero Splash banner */}
            <div className="hero-banner glass-card">
              <div className="hero-content">
                <span className="hero-tag">AuraEvents 2026</span>
                <h1>Discover and Secure Premium Passes</h1>
                <p>Industry-grade booking engine with instant cryptographic gate credentials.</p>
              </div>
              <div className="hero-illustration">
                <CalendarRange size={120} className="floating-calendar" />
              </div>
            </div>

            {/* Catalog Controls */}
            <div className="catalog-filters-bar glass-card">
              <div className="search-box-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search events by title, description or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control filter-search"
                />
              </div>

              <div className="category-row-scroller">
                <SlidersHorizontal size={16} className="text-muted" />
                <div className="category-scroll-inner">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {error && (
              <div className="glass-card error-card">
                <AlertTriangle size={32} className="text-danger" />
                <h3>Failed to load catalog</h3>
                <p>{error}</p>
                <button onClick={fetchEvents} className="btn btn-primary">Retry</button>
              </div>
            )}

            {/* Loading Shimmer cards */}
            {loading ? (
              <div className="grid-events">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card loading-card-shimmer">
                    <div className="shimmer shimmer-image" />
                    <div className="shimmer-body">
                      <div className="shimmer shimmer-title" />
                      <div className="shimmer shimmer-text" />
                      <div className="shimmer shimmer-meta" />
                      <div className="shimmer shimmer-btn" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="grid-events">
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onBook={(evt) => setSelectedEvent(evt)} 
                    />
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="glass-card empty-catalog-card">
                    <AlertTriangle size={32} className="text-warning" />
                    <h3>No events found</h3>
                    <p>No active directories matched your search keywords or category filters.</p>
                    <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="btn btn-outline">
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Organize / Event Creation Form */}
        {view === 'create' && (
          <EventCreationForm onEventCreated={handleEventCreated} />
        )}

        {/* VIEW 3: Admin Analytics Dashboard */}
        {view === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* VIEW 4: QR Gate Scanner */}
        {view === 'scanner' && (
          <QRScanner />
        )}

        {/* VIEW 5: My Tickets retrieval page */}
        {view === 'tickets' && (
          <MyTickets 
            userEmail={userEmail} 
            onEmailUpdated={(email) => setUserEmail(email)} 
          />
        )}

      </main>

      {/* Ticket Purchase Modal wrapper */}
      {selectedEvent && (
        <TicketBookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onBookingSuccess={handleBookingSuccess}
          prefillEmail={userEmail}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>&copy; 2026 AuraEvents Systems Inc. All rights reserved.</span>
          <div className="footer-links">
            <span className="bullet-link">Secure Bank Portal Connected</span>
            <span className="bullet-link">Fallback Offline Ledger Ready</span>
          </div>
        </div>
      </footer>

      <style>{`
        .bg-glow-layer {
          position: fixed;
          top: -200px;
          left: 30%;
          width: 600px;
          height: 600px;
          background: var(--gradient-glow);
          pointer-events: none;
          z-index: -1;
        }

        .app-main-content {
          flex-grow: 1;
          padding: 40px 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Hero Banner */
        .hero-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 40px 48px;
          margin-bottom: 32px;
          background: linear-gradient(135deg, rgba(27, 21, 53, 0.6) 0%, rgba(18, 14, 36, 0.8) 100%);
          border: 1px solid var(--border-glass);
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-tag {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 2px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .hero-content h1 {
          font-size: 2.2rem;
          color: white;
          margin-bottom: 12px;
        }

        .hero-illustration {
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--color-primary);
          opacity: 0.15;
        }

        .floating-calendar {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        /* Catalog Filters Bar */
        .catalog-filters-bar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .search-box-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .filter-search {
          padding-left: 48px;
          width: 100%;
        }

        .category-row-scroller {
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 1px solid var(--border-glass);
          padding-top: 14px;
        }

        .category-scroll-inner {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .category-scroll-inner::-webkit-scrollbar {
          height: 4px;
        }

        .filter-cat-btn {
          padding: 6px 14px;
          background: transparent;
          border: 1px solid var(--border-glass);
          border-radius: 99px;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition-fast);
        }

        .filter-cat-btn:hover {
          color: white;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .filter-cat-btn.active {
          background: rgba(139, 92, 246, 0.1);
          color: white;
          border-color: var(--color-primary);
        }

        /* Shimmer Cards loading state */
        .loading-card-shimmer {
          height: 380px;
          display: flex;
          flex-direction: column;
        }

        .shimmer-image {
          height: 180px;
          width: 100%;
        }

        .shimmer-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex-grow: 1;
        }

        .shimmer-title {
          height: 20px;
          width: 70%;
          border-radius: 4px;
        }

        .shimmer-text {
          height: 40px;
          width: 100%;
          border-radius: 4px;
        }

        .shimmer-meta {
          height: 16px;
          width: 50%;
          border-radius: 4px;
          margin-top: auto;
        }

        .shimmer-btn {
          height: 38px;
          width: 100%;
          border-radius: var(--radius-md);
        }

        /* Error/Empty Catalogs */
        .error-card, .empty-catalog-card {
          padding: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .error-card h3, .empty-catalog-card h3 {
          font-size: 1.25rem;
          color: white;
        }

        /* Footer */
        .app-footer {
          border-top: 1px solid var(--border-glass);
          padding: 24px;
          background: rgba(10, 7, 18, 0.9);
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          gap: 16px;
        }

        .footer-links {
          display: flex;
          gap: 16px;
        }

        .bullet-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .bullet-link::before {
          content: '';
          width: 4px;
          height: 4px;
          background: var(--color-success);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 6px var(--color-success);
        }

        @media (max-width: 768px) {
          .hero-banner {
            padding: 24px;
            flex-direction: column;
            text-align: center;
          }
          .hero-illustration {
            display: none;
          }
          .hero-content h1 {
            font-size: 1.6rem;
          }
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
