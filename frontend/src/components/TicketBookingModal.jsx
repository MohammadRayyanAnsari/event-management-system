import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, ShieldCheck, Ticket, Download, Mail, User, Info, Loader2, Sparkles } from 'lucide-react';

const TicketBookingModal = ({ event, onClose, onBookingSuccess, prefillEmail }) => {
  const { _id, title, price, capacity, bookedTickets, location, date, time } = event;
  const remaining = capacity - bookedTickets;

  const [step, setStep] = useState(1); // 1 = Details & Payment, 2 = Processing, 3 = Ticket Issued
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(prefillEmail || '');
  const [ticketsCount, setTicketsCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'qr'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [error, setError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [progressText, setProgressText] = useState('Initiating secure gateway connection...');

  const totalPrice = price * ticketsCount;

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // Digits only
    const trimmed = rawVal.substring(0, 16); // Maximum 16 digits
    const parts = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      parts.push(trimmed.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Simulated gateway messages
  useEffect(() => {
    if (step === 2) {
      const messages = [
        'Initiating secure gateway connection...',
        'Validating payment authorization token...',
        'Checking secure ledger accounts...',
        'Finalizing ticket allocations...',
        'Passes secured!'
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        index++;
        if (index < messages.length) {
          setProgressText(messages[index]);
        } else {
          clearInterval(interval);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (ticketsCount > remaining) {
      setError(`Only ${remaining} tickets are available.`);
      return;
    }

    const cleanCard = cardNumber.replace(/\D/g, '');

    if (paymentMethod === 'card') {
      if (cleanCard.length !== 16) {
        setError('Payment Validation Failed: Credit Card must be exactly 16 digits.');
        return;
      }
      if (!cardExpiry || !cardCvv) {
        setError('Expiry and CVV are required.');
        return;
      }
    }

    // Enter processing state
    setStep(2);

    try {
      // Simulate network delay to banking node
      await new Promise(resolve => setTimeout(resolve, 3200));

      const payload = {
        eventId: _id,
        customerName,
        customerEmail,
        ticketsCount,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? { cardNumber: cleanCard } : null
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment processing failed');
      }

      setBookingResult(data);
      setStep(3);
      if (onBookingSuccess) {
        onBookingSuccess(customerEmail);
      }
    } catch (err) {
      setError(err.message);
      setStep(1); // Go back to payment page to retry
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=120e24&bgcolor=ffffff&data=${bookingResult.ticketQRCode}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Pass - ${title}</title>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              color: #0b0813;
              background: #fff;
              padding: 40px;
              margin: 0;
            }
            .ticket-card {
              max-width: 500px;
              margin: 0 auto;
              border: 2px solid #cbd5e1;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .ticket-header {
              background: #120e24;
              color: white;
              padding: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px dashed #cbd5e1;
            }
            .ticket-brand {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #8b5cf6;
              text-transform: uppercase;
            }
            .ticket-title {
              font-size: 20px;
              margin: 6px 0 0 0;
              font-weight: 800;
            }
            .ticket-price {
              background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
              font-size: 13px;
              font-weight: 700;
              padding: 6px 12px;
              border-radius: 99px;
              color: white;
            }
            .ticket-body {
              padding: 24px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-lbl {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-val {
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;
              margin-top: 2px;
            }
            .qr-section {
              display: flex;
              align-items: center;
              gap: 20px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .qr-box {
              width: 100px;
              height: 100px;
              padding: 4px;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
            }
            .qr-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .ref-box {
              display: flex;
              flex-direction: column;
            }
            .ref-code {
              font-family: monospace;
              font-size: 16px;
              font-weight: 700;
              color: #8b5cf6;
              letter-spacing: 0.5px;
            }
            .ticket-footer {
              padding: 16px 24px;
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
            }
            @media print {
              body { padding: 0; }
              .ticket-card { border: 1px solid #cbd5e1; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="ticket-header">
              <div>
                <div class="ticket-brand">AuraEvents PASS</div>
                <h3 class="ticket-title">${title}</h3>
              </div>
              <span class="ticket-price">$${bookingResult.totalPaid} Paid</span>
            </div>
            <div class="ticket-body">
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-lbl">Attendee</span>
                  <span class="meta-val">${bookingResult.customerName}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-lbl">Quantity</span>
                  <span class="meta-val">${bookingResult.ticketsCount} Pass(es)</span>
                </div>
                <div class="meta-item">
                  <span class="meta-lbl">Date & Time</span>
                  <span class="meta-val">${new Date(date).toLocaleDateString()} at ${time}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-lbl">Location</span>
                  <span class="meta-val">${location}</span>
                </div>
              </div>
              <div class="qr-section">
                <div class="qr-box">
                  <img src="${qrUrl}" class="qr-img" />
                </div>
                <div class="ref-box">
                  <span class="meta-lbl">Ticket Reference</span>
                  <span class="ref-code">${bookingResult.ticketQRCode}</span>
                </div>
              </div>
            </div>
            <div class="ticket-footer">
              Present QR code at the event gate for verification.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${step === 3 ? 'success-size' : ''}`}>
        {step !== 2 && (
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        )}

        {/* STEP 1: Details and Payment Choice */}
        {step === 1 && (
          <div>
            <div className="modal-header">
              <span className="badge badge-category">Pass Booking</span>
              <h2>{title}</h2>
              <p className="modal-price-lead">
                Ticket Price: <strong>{price === 0 ? 'Free' : `$${price}`}</strong> each
              </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-control padded-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com (tickets will be sent here)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-control padded-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Number of Tickets</label>
                  <select
                    value={ticketsCount}
                    onChange={(e) => setTicketsCount(Number(e.target.value))}
                    className="form-control"
                  >
                    {[...Array(Math.min(remaining, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Ticket{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group total-sum-box">
                  <label className="form-label">Total Payable</label>
                  <span className="payable-amount">
                    ${totalPrice}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-gateway-wrapper">
                <label className="form-label">Select Payment Method</label>
                <div className="payment-tabs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  >
                    <CreditCard size={18} />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`payment-tab ${paymentMethod === 'qr' ? 'active' : ''}`}
                  >
                    <QrCode size={18} />
                    <span>Scan UPI QR</span>
                  </button>
                </div>

                <div className="payment-tab-content">
                  {paymentMethod === 'card' ? (
                    <div className="card-fields">
                      <div className="form-group">
                        <label className="form-label">Card Number (16 Digits)</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="form-control text-center card-num-input"
                        />
                        <span className="card-hint">
                          Format: exactly 16 digits total. 
                          {cardNumber.replace(/\D/g, '').length !== 16 && (
                            <span className="text-warning"> Current: {cardNumber.replace(/\D/g, '').length} digits.</span>
                          )}
                        </span>
                      </div>
                      <div className="payment-charge-summary">
                        Total Amount to Charge: <strong>${totalPrice}</strong>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            placeholder="MM/YY"
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="form-control text-center"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input
                            type="password"
                            required={paymentMethod === 'card'}
                            placeholder="***"
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="form-control text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-fields">
                      <div className="qr-code-placeholder">
                        {/* Dynamic free mock QR generator URL */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=8b5cf6&bgcolor=120e24&data=upi://pay?pa=auraevents@bank%26pn=AuraEvents%26am=${totalPrice}%26cu=USD`} 
                          alt="Payment QR Code" 
                          className="qr-img"
                        />
                        <div className="qr-scanner-glow" />
                      </div>
                      <p className="qr-instructions">
                        Scan with your banking app to transfer <strong>${totalPrice}</strong>
                      </p>
                      <div className="qr-action-footer">
                        <span className="security-notice">Continue by clicking below to secure your transaction.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary pay-btn">
                  <ShieldCheck size={18} />
                  <span>
                    {paymentMethod === 'card' ? 'Secure Payment' : 'Continue to Payment'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Processing Gate */}
        {step === 2 && (
          <div className="processing-container">
            <div className="processing-sphere-wrapper">
              <Loader2 className="processing-spinner" size={64} />
              <div className="shield-ring" />
            </div>
            <h3>Securing Transaction...</h3>
            <p className="pulse-text">{progressText}</p>
            <div className="secure-badge">
              <ShieldCheck size={14} />
              <span>AES-256 PCI Compliant Connection</span>
            </div>
          </div>
        )}

        {/* STEP 3: Booking Success Ticket Pass */}
        {step === 3 && bookingResult && (
          <div className="success-container print-section">
            <div className="success-icon-badge">
              <Sparkles size={28} />
            </div>
            
            <div className="success-heading">
              <h2 className="gradient-text">Booking Confirmed!</h2>
              <p>Your digital tickets are secured and active for scanning.</p>
            </div>

            {/* Premium Digital Boarding Pass */}
            <div className="ticket-pass-card">
              <div className="ticket-header">
                <div>
                  <span className="ticket-brand">AuraEvents PASS</span>
                  <h3 className="ticket-title">{title}</h3>
                </div>
                <div className="ticket-amount-badge">${bookingResult.totalPaid} Paid</div>
              </div>

              <div className="ticket-body">
                <div className="ticket-meta-grid">
                  <div className="ticket-meta-item">
                    <span className="ticket-meta-label">ATTENDEE</span>
                    <span className="ticket-meta-val">{bookingResult.customerName}</span>
                  </div>
                  <div className="ticket-meta-item">
                    <span className="ticket-meta-label">QUANTITY</span>
                    <span className="ticket-meta-val">{bookingResult.ticketsCount} Pass{bookingResult.ticketsCount > 1 ? 'es' : ''}</span>
                  </div>
                  <div className="ticket-meta-item">
                    <span className="ticket-meta-label">DATE & TIME</span>
                    <span className="ticket-meta-val">{new Date(date).toLocaleDateString()} at {time}</span>
                  </div>
                  <div className="ticket-meta-item">
                    <span className="ticket-meta-label">LOCATION</span>
                    <span className="ticket-meta-val text-truncate">{location}</span>
                  </div>
                </div>

                {/* QR Check-in Code */}
                <div className="ticket-qr-section">
                  <div className="ticket-qr-frame">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=120e24&bgcolor=ffffff&data=${bookingResult.ticketQRCode}`} 
                      alt="Digital Ticket QR Code" 
                      className="ticket-qr-img"
                    />
                  </div>
                  <div className="ticket-code-tag">
                    <span className="ticket-meta-label">TICKET REFERENCE</span>
                    <span className="ticket-ref-text">{bookingResult.ticketQRCode}</span>
                  </div>
                </div>
              </div>
              
              <div className="ticket-tear-line">
                <div className="tear-dot left"></div>
                <div className="tear-dot right"></div>
              </div>
              
              <div className="ticket-footer">
                <ShieldCheck size={16} className="text-success" />
                <span>Verified digital pass. Present QR code at the event gate.</span>
              </div>
            </div>

            <div className="success-actions no-print">
              <button onClick={handlePrint} className="btn btn-outline">
                <Download size={18} />
                <span>Save / Print PDF</span>
              </button>
              <button onClick={onClose} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          z-index: 10;
        }

        .modal-close-btn:hover {
          color: white;
          border-color: var(--color-primary);
          background: rgba(139, 92, 246, 0.1);
        }

        .modal-header {
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 1.6rem;
          margin-top: 8px;
          margin-bottom: 4px;
        }

        .modal-price-lead {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .modal-price-lead strong {
          color: var(--color-primary);
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .padded-input {
          padding-left: 48px;
          width: 100%;
        }

        .total-sum-box {
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: var(--radius-md);
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .payable-amount {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.8rem;
          color: white;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .payment-gateway-wrapper {
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: 8px;
        }

        .payment-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 10px;
          margin-bottom: 16px;
        }

        .payment-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 12px;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .payment-tab:hover {
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .payment-tab.active {
          background: rgba(139, 92, 246, 0.08);
          border-color: var(--color-primary);
          color: white;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);
        }

        .payment-tab-content {
          background: rgba(0, 0, 0, 0.15);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--border-glass);
        }

        .card-num-input {
          font-size: 1.2rem;
          letter-spacing: 2px;
        }

        .card-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .payment-charge-summary {
          margin: 16px 0;
          padding: 12px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .payment-charge-summary strong {
          color: white;
          font-size: 1.1rem;
        }

        .text-warning {
          color: var(--color-warning);
        }

        .qr-fields {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .qr-code-placeholder {
          position: relative;
          padding: 16px;
          background: #120e24;
          border-radius: var(--radius-md);
          border: 1px solid rgba(139, 92, 246, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 170px;
          height: 170px;
        }

        .qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-scanner-glow {
          position: absolute;
          inset: 0;
          border: 2px dashed var(--color-primary);
          border-radius: var(--radius-md);
          animation: scanRotator 12s linear infinite;
        }

        @keyframes scanRotator {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }

        .qr-instructions {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .qr-action-footer {
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: 12px;
        }

        .pay-btn {
          min-width: 180px;
        }

        /* Processing step */
        .processing-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          text-align: center;
          gap: 20px;
        }

        .processing-sphere-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .processing-spinner {
          color: var(--color-primary);
          animation: spin 1.2s linear infinite;
        }

        .shield-ring {
          position: absolute;
          inset: -10px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 50%;
          animation: ringPulse 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .pulse-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
          height: 24px;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 99px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-glass);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Success Step styles */
        .success-size {
          max-width: 500px;
        }

        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 24px;
        }

        .success-icon-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--color-success-bg);
          color: #34d399;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        .success-heading h2 {
          font-size: 1.8rem;
          margin-bottom: 6px;
        }

        .success-heading p {
          font-size: 0.9rem;
        }

        /* Premium Ticket Pass Design */
        .ticket-pass-card {
          width: 100%;
          background: #fff;
          color: #0b0813;
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .ticket-header {
          background: #120e24;
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px dashed rgba(255, 255, 255, 0.1);
        }

        .ticket-brand {
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
        }

        .ticket-title {
          font-size: 1.1rem;
          margin-top: 4px;
          font-weight: 800;
          line-height: 1.2;
        }

        .ticket-amount-badge {
          background: var(--gradient-primary);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 99px;
          color: white;
        }

        .ticket-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ticket-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .ticket-meta-item {
          display: flex;
          flex-direction: column;
        }

        .ticket-meta-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .ticket-meta-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }

        .ticket-qr-section {
          display: flex;
          align-items: center;
          gap: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }

        .ticket-qr-frame {
          width: 90px;
          height: 90px;
          padding: 4px;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-sm);
          background: white;
        }

        .ticket-qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ticket-code-tag {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ticket-ref-text {
          font-family: monospace;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.5px;
        }

        .ticket-tear-line {
          position: relative;
          height: 0px;
          border-bottom: 2px dotted #cbd5e1;
          background: transparent;
        }

        .tear-dot {
          position: absolute;
          width: 16px;
          height: 16px;
          background: var(--bg-surface);
          border-radius: 50%;
          top: -8px;
        }
        
        .tear-dot.left {
          left: -8px;
        }

        .tear-dot.right {
          right: -8px;
        }

        .ticket-footer {
          padding: 16px 20px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
        }

        .success-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }

        /* Print Media Styles */
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .modal-overlay {
            background: transparent;
            position: relative;
          }
          .modal-content {
            border: none;
            box-shadow: none;
            background: transparent;
            max-width: 100%;
            padding: 0;
          }
          .ticket-pass-card {
            box-shadow: none;
            border: 1px solid #cbd5e1;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketBookingModal;
