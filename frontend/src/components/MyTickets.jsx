import React, { useState } from 'react';
import { Mail, Search, Ticket, Calendar, MapPin, QrCode, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const MyTickets = ({ userEmail, onEmailUpdated }) => {
  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchTickets = async (emailToQuery) => {
    const email = emailToQuery || emailInput;
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(email.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve ticket bookings');
      }
      const data = await response.json();
      setTickets(data);
      if (onEmailUpdated) {
        onEmailUpdated(email.trim());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch tickets if user email is already set in app state
  React.useEffect(() => {
    if (userEmail) {
      fetchTickets(userEmail);
    }
  }, [userEmail]);

  return (
    <div className="tickets-page-container">
      {/* Search Header */}
      <div className="glass-card tickets-search-card">
        <div className="search-header">
          <Ticket size={24} className="icon-purple" />
          <div>
            <h2>My Digital Passes</h2>
            <p>Enter your registration email to retrieve active gate passes.</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="tickets-search-bar">
          <div className="input-with-icon full-width">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="e.g. attendee@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="form-control padded-input"
            />
          </div>
          <button 
            onClick={() => fetchTickets()} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Search size={18} />}
            <span>{loading ? 'Retrieving...' : 'Retrieve passes'}</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="tickets-grid">
        {tickets.map((t, idx) => (
          <div key={idx} className="glass-card retrieved-ticket-card">
            <div className="ticket-card-header">
              <div className="ticket-badge-row">
                <span className="badge badge-category">{t.eventId?.category || 'Event'}</span>
                {t.checkInStatus ? (
                  <span className="badge-checkin success">
                    <CheckCircle2 size={12} />
                    <span>Checked In</span>
                  </span>
                ) : (
                  <span className="badge-checkin pending">
                    <div className="pulse-indicator" />
                    <span>Active Gate Pass</span>
                  </span>
                )}
              </div>
              <h3 className="ticket-card-title">{t.eventId?.title || 'Unknown Event'}</h3>
            </div>

            <div className="ticket-card-body">
              <div className="ticket-grid-meta">
                <div className="meta-row">
                  <Calendar size={14} />
                  <span>{t.eventId?.date ? new Date(t.eventId.date).toLocaleDateString() : 'Date'} at {t.eventId?.time || 'Time'}</span>
                </div>
                <div className="meta-row">
                  <MapPin size={14} />
                  <span className="text-truncate">{t.eventId?.location || 'Venue'}</span>
                </div>
              </div>

              <div className="ticket-qr-block">
                <div className="qr-container-box">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=120e24&bgcolor=ffffff&data=${t.ticketQRCode}`} 
                    alt="Check-in QR" 
                    className="qr-img-tag"
                  />
                </div>
                <div className="qr-text-block">
                  <span className="tkt-ref-lbl">PASS CODE</span>
                  <code className="tkt-ref-code">{t.ticketQRCode}</code>
                  <span className="tkt-qty-lbl">{t.ticketsCount} Ticket{t.ticketsCount > 1 ? 's' : ''} • Paid ${t.totalPaid}</span>
                  <span className="tkt-name-lbl">Holder: {t.customerName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {searched && tickets.length === 0 && !loading && (
          <div className="glass-card empty-tickets-card">
            <AlertTriangle size={32} className="text-warning" />
            <h3>No Tickets Found</h3>
            <p>We couldn't find any active tickets registered to <strong>{emailInput}</strong>. Double check your email or purchase passes first.</p>
          </div>
        )}
      </div>

      <style>{`
        .tickets-page-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .tickets-search-card {
          padding: 32px;
        }

        .search-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
        }

        .icon-purple {
          color: var(--color-primary);
        }

        .tickets-search-bar {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
        }

        .full-width {
          width: 100%;
        }

        .tickets-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .retrieved-ticket-card {
          padding: 24px;
          border-left: 4px solid var(--color-primary);
        }
        .retrieved-ticket-card:hover {
          border-left-color: var(--color-secondary);
        }

        .ticket-card-header {
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .ticket-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .badge-checkin {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-checkin.success {
          background: var(--color-success-bg);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .badge-checkin.pending {
          background: rgba(139, 92, 246, 0.08);
          color: var(--color-primary);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .ticket-card-title {
          font-size: 1.25rem;
          color: white;
        }

        .ticket-card-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ticket-grid-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ticket-qr-block {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid var(--border-glass);
        }

        .qr-container-box {
          width: 100px;
          height: 100px;
          padding: 4px;
          background: white;
          border-radius: var(--radius-sm);
        }

        .qr-img-tag {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-text-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tkt-ref-lbl {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .tkt-ref-code {
          font-family: monospace;
          font-size: 1rem;
          font-weight: 700;
          color: #c084fc;
        }

        .tkt-qty-lbl {
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .tkt-name-lbl {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .empty-tickets-card {
          padding: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .empty-tickets-card h3 {
          font-size: 1.2rem;
          color: white;
        }

        .empty-tickets-card p {
          max-width: 400px;
        }

        @media (max-width: 600px) {
          .tickets-search-bar {
            grid-template-columns: 1fr;
          }
          .ticket-qr-block {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MyTickets;
