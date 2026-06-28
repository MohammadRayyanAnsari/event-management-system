import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { Scan, ShieldAlert, CheckCircle2, AlertTriangle, Search, Clock, RefreshCw, Sparkles, UserCheck } from 'lucide-react';

const QRScanner = () => {
  const [ticketQRCode, setTicketQRCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { status: 'success'|'warning'|'error', message, booking }
  const [bookings, setBookings] = useState([]);
  const [loadBookingsLoading, setLoadBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('simulate'); // 'manual' or 'simulate'

  const handleQrImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            handleCheckIn(code.data);
          } else {
            setResult({
              status: 'error',
              message: 'Failed to parse ticket: No valid QR code detected in the image. Please upload a clear image of the ticket QR code.',
              booking: null
            });
            setLoading(false);
          }
        } catch (err) {
          setResult({
            status: 'error',
            message: 'Image processing failed: ' + err.message,
            booking: null
          });
          setLoading(false);
        }
      };
      img.onerror = () => {
        setResult({
          status: 'error',
          message: 'Failed to load image file.',
          booking: null
        });
        setLoading(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Fetch bookings so organizers can easily simulate scanning them
  const fetchAllBookingsForSimulation = async () => {
    setLoadBookingsLoading(true);
    try {
      // Find bookings across all emails, or we can fetch a specific summary.
      // Wait, let's create a small endpoint in backend or load via analytics or just list.
      // Since booking.find({}) without email can be loaded if we query bookings, let's fetch from `/api/analytics` or `/api/bookings?all=true`?
      // Wait, let's look at `bookings.js`. We wrote:
      // `GET /api/bookings?email=...`
      // Wait, is there a way to query bookings? Let's check.
      // If we don't have an 'all' route, let's look at our analytics endpoint!
      // In `analytics.js`, we did:
      // const bookings = await Booking.find({});
      // But it doesn't return full bookings list.
      // Wait, we can fetch all bookings if we query the backend. Let's make sure we can fetch it, or query bookings by adding a wildcard search or getting them from the database fallback.
      // Wait, let's modify `/api/bookings` in `backend/routes/bookings.js` so if `email` is not provided, it can list all bookings, OR let's just make it return bookings.
      // Let's double check `backend/routes/bookings.js`. It does:
      // `if (!email) { return res.status(400).json({ message: 'Email query parameter is required.' }); }`
      // Ah! So it requires email. But wait! If we modify `backend/routes/bookings.js` to allow listing all bookings if `email === 'all'`, that would be extremely helpful for this dashboard simulation!
      // Yes! Let's check how we can query bookings. If we call `/api/bookings?email=all` or `/api/bookings` without email, we can return all bookings. Let's support this. We can quickly update `backend/routes/bookings.js` using `replace_file_content` to make `email` optional or support `email=all`.
      // Let's check: can we just fetch `/api/analytics`? In `analytics`, we already fetch events and bookings, but we don't return the full bookings list.
      // Let's modify `backend/routes/bookings.js` to allow fetching all bookings if `email` is not provided or equals `all`.
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingsList = async () => {
    setLoadBookingsLoading(true);
    try {
      // Fetch bookings list. Let's send request with email=all which we will support in backend!
      const res = await fetch('/api/bookings?email=all');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings list:', err);
    } finally {
      setLoadBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, []);

  const handleCheckIn = async (codeToSubmit) => {
    const code = codeToSubmit || ticketQRCode;
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/bookings/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketQRCode: code.trim() })
      });

      const data = await response.json();

      if (response.status === 400 && data.message === 'Already Checked In') {
        setResult({
          status: 'warning',
          message: 'Access Alert: This pass has already checked in.',
          booking: data.booking
        });
      } else if (!response.ok) {
        setResult({
          status: 'error',
          message: data.message || 'Ticket invalid. Gate authorization denied.',
          booking: null
        });
      } else {
        setResult({
          status: 'success',
          message: 'Access Granted: Checked In Successfully!',
          booking: data.booking
        });
        // Refresh simulation list to update check-in status badge
        fetchBookingsList();
      }
    } catch (err) {
      setResult({
        status: 'error',
        message: 'Network verification timeout. Try again.',
        booking: null
      });
    } finally {
      setLoading(false);
      setTicketQRCode('');
    }
  };

  return (
    <div className="scanner-layout">
      {/* Sidebar Control Panel */}
      <div className="scanner-main">
        <div className="glass-card scanner-card">
          <div className="scanner-title-area">
            <Scan className="scan-pulse-icon" size={24} />
            <div>
              <h2>Gate Authorization Portal</h2>
              <p>Scan ticket QR codes or verify booking reference IDs below.</p>
            </div>
          </div>

          <div className="scanner-tabs">
            <button
              onClick={() => { setActiveTab('simulate'); setResult(null); }}
              className={`scanner-tab ${activeTab === 'simulate' ? 'active' : ''}`}
            >
              Simulate Gate Scan
            </button>
            <button
              onClick={() => { setActiveTab('upload'); setResult(null); }}
              className={`scanner-tab ${activeTab === 'upload' ? 'active' : ''}`}
            >
              Upload QR Image
            </button>
            <button
              onClick={() => { setActiveTab('manual'); setResult(null); }}
              className={`scanner-tab ${activeTab === 'manual' ? 'active' : ''}`}
            >
              Manual Key-In
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="upload-entry-box" style={{ marginBottom: '20px' }}>
              <label className="form-label">Upload Ticket QR Image</label>
              <div className="qr-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  className="qr-file-input"
                  id="qr-file-upload"
                />
                <div className="qr-upload-label">
                  <div className="upload-icon-wrapper">
                    <Scan className="upload-pulse-icon" size={32} />
                  </div>
                  <span>Click to choose or drag & drop ticket image</span>
                  <span className="file-formats-note">Supports PNG, JPG, JPEG</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' ? (
            <div className="manual-entry-box">
              <label className="form-label">Ticket QR Code Reference ID</label>
              <div className="input-search-row">
                <input
                  type="text"
                  placeholder="e.g. qr_tkt_A7F3X..."
                  value={ticketQRCode}
                  onChange={(e) => setTicketQRCode(e.target.value)}
                  className="form-control"
                />
                <button 
                  onClick={() => handleCheckIn()} 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Authorize'}
                </button>
              </div>
            </div>
          ) : (
            <div className="simulate-entry-box">
              <div className="simulate-header">
                <span>Active Booking Passes Database ({bookings.length})</span>
                <button onClick={fetchBookingsList} className="btn-icon-only" title="Refresh Database">
                  <RefreshCw size={14} className={loadBookingsLoading ? 'spin' : ''} />
                </button>
              </div>
              
              <div className="simulate-list">
                {bookings.map((b, idx) => (
                  <div key={idx} className="sim-booking-item">
                    <div className="sim-item-details">
                      <div className="sim-item-name">
                        <strong>{b.customerName}</strong> 
                        <span className="sim-item-email">({b.customerEmail})</span>
                      </div>
                      <div className="sim-item-event text-truncate">
                        {b.eventId?.title || 'Unknown Event'} ({b.ticketsCount} Ticket{b.ticketsCount > 1 ? 's' : ''})
                      </div>
                      <div className="sim-item-code">
                        Ref: <code>{b.ticketQRCode}</code>
                      </div>
                    </div>

                    <div className="sim-item-action">
                      {b.checkInStatus ? (
                        <span className="badge badge-success-filled">Checked In</span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(b.ticketQRCode)}
                          className="btn btn-outline btn-sm-scan"
                        >
                          Simulate Scan
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {bookings.length === 0 && !loadBookingsLoading && (
                  <div className="empty-sim-state">
                    <AlertTriangle size={24} className="text-warning" />
                    <p>No active bookings in database. Purchase a ticket first!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Display */}
      <div className="scanner-result-panel">
        <h3 className="result-heading">Gate Authorization Feed</h3>
        
        {result ? (
          <div className={`glass-card result-display-card ${result.status}`}>
            <div className="result-top">
              {result.status === 'success' && <CheckCircle2 size={48} className="result-icon success" />}
              {result.status === 'warning' && <AlertTriangle size={48} className="result-icon warning" />}
              {result.status === 'error' && <ShieldAlert size={48} className="result-icon error" />}
              
              <div className="result-text-box">
                <h4>{result.status.toUpperCase()}</h4>
                <p className="result-message">{result.message}</p>
              </div>
            </div>

            {result.booking && (
              <div className="result-booking-details">
                <div className="res-grid-row">
                  <span className="res-lbl">EVENT</span>
                  <span className="res-val font-highlight">{result.booking.eventId?.title || 'Event Directory'}</span>
                </div>
                <div className="res-grid-row">
                  <span className="res-lbl">ATTENDEE</span>
                  <span className="res-val">{result.booking.customerName}</span>
                </div>
                <div className="res-grid-row">
                  <span className="res-lbl">EMAIL</span>
                  <span className="res-val">{result.booking.customerEmail}</span>
                </div>
                <div className="res-grid-row">
                  <span className="res-lbl">PASS VOLUME</span>
                  <span className="res-val">{result.booking.ticketsCount} Ticket{result.booking.ticketsCount > 1 ? 's' : ''}</span>
                </div>
                <div className="res-grid-row">
                  <span className="res-lbl">TICKET CODE</span>
                  <span className="res-val code-style">{result.booking.ticketQRCode}</span>
                </div>
                {result.status === 'warning' && (
                  <div className="warning-meta-timestamp">
                    <Clock size={12} />
                    <span>Double scan rejected. Original Check-in recorded in ledger.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card result-display-card empty-feed">
            <Scan className="scan-placeholder-icon" size={48} />
            <p>Awaiting scan signals at the gate...</p>
          </div>
        )}
      </div>

      <style>{`
        .scanner-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          align-items: start;
        }

        .scanner-card {
          padding: 32px;
        }

        .scanner-title-area {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
        }

        .scan-pulse-icon {
          color: var(--color-primary);
          animation: scanPulse 2s infinite;
        }

        @keyframes scanPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 8px var(--color-primary)); }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .scanner-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .scanner-tab {
          padding: 12px;
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

        .scanner-tab.active {
          background: var(--bg-surface-elevated);
          border-color: var(--color-primary);
          color: white;
        }

        .input-search-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          margin-top: 10px;
        }

        /* Simulate Booking Items styles */
        .simulate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .btn-icon-only {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .btn-icon-only:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .spin {
          animation: spin 1.2s linear infinite;
        }

        .simulate-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .sim-booking-item {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          transition: var(--transition-fast);
        }

        .sim-booking-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .sim-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.8rem;
          overflow: hidden;
        }

        .sim-item-name {
          color: white;
        }
        
        .sim-item-email {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-left: 4px;
        }

        .sim-item-event {
          color: var(--text-secondary);
        }

        .sim-item-code code {
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: #c084fc;
        }

        .btn-sm-scan {
          padding: 6px 12px;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .badge-success-filled {
          background: var(--color-success);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .empty-sim-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          text-align: center;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        /* Result Panel */
        .scanner-result-panel {
          position: sticky;
          top: 100px;
        }

        .result-heading {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-display-card {
          padding: 24px;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-width: 2px;
        }

        .result-display-card.empty-feed {
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          gap: 16px;
        }

        .scan-placeholder-icon {
          color: var(--text-muted);
          opacity: 0.3;
        }

        .result-top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .result-icon.success { color: var(--color-success); }
        .result-icon.warning { color: var(--color-warning); }
        .result-icon.error { color: var(--color-danger); }

        .result-text-box h4 {
          font-size: 1.2rem;
          letter-spacing: 1px;
        }

        .result-display-card.success h4 { color: var(--color-success); }
        .result-display-card.warning h4 { color: var(--color-warning); }
        .result-display-card.error h4 { color: var(--color-danger); }

        .result-message {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .result-booking-details {
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .res-grid-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 8px;
        }

        .res-grid-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .res-lbl {
          color: var(--text-muted);
          font-weight: 700;
        }

        .res-val {
          color: var(--text-primary);
          font-weight: 600;
        }

        .font-highlight {
          color: var(--color-primary);
        }

        .code-style {
          font-family: monospace;
          color: #c084fc;
        }

        .warning-meta-timestamp {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-warning);
          font-size: 0.7rem;
          font-weight: 500;
          margin-top: 4px;
        }

        @media (max-width: 900px) {
          .scanner-layout {
            grid-template-columns: 1fr;
          }
          .scanner-result-panel {
            position: relative;
            top: 0;
          }
        }

        .qr-upload-area {
          border: 2px dashed var(--border-glass);
          border-radius: var(--radius-md);
          padding: 40px 20px;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          position: relative;
          transition: var(--transition-normal);
        }

        .qr-upload-area:hover {
          border-color: var(--color-primary);
          background: rgba(139, 92, 246, 0.03);
        }

        .qr-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          z-index: 5;
        }

        .qr-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .upload-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.08);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .upload-pulse-icon {
          animation: scanPulse 2s infinite;
        }

        .file-formats-note {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
