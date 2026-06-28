import React from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onBook }) => {
  const { title, description, date, time, location, price, category, capacity, bookedTickets, imageUrl } = event;
  
  const remaining = capacity - bookedTickets;
  const isSoldOut = remaining <= 0;
  const sellPercent = Math.min(Math.round((bookedTickets / capacity) * 100), 100);

  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card event-card">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={title} className="card-image" loading="lazy" />
        <div className="card-overlay" />
        <div className="card-badge-container">
          <span className="badge badge-category">{category}</span>
          <span className="badge badge-price">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title" title={title}>{title}</h3>
        <p className="card-desc">{description}</p>

        <div className="card-meta">
          <div className="meta-item">
            <Calendar size={15} />
            <span>{formattedDate}</span>
          </div>
          <div className="meta-item">
            <Clock size={15} />
            <span>{time}</span>
          </div>
          <div className="meta-item">
            <MapPin size={15} />
            <span className="text-truncate">{location}</span>
          </div>
        </div>

        <div className="ticket-progress-wrapper">
          <div className="progress-label">
            <div className="progress-info">
              <Users size={14} />
              <span>{bookedTickets} / {capacity} Booked</span>
            </div>
            <span className="remaining-text">
              {isSoldOut ? 'Sold Out' : `${remaining} left`}
            </span>
          </div>
          <div className="progress-track">
            <div 
              className={`progress-bar ${sellPercent > 85 ? 'urgent' : ''}`} 
              style={{ width: `${sellPercent}%` }} 
            />
          </div>
        </div>

        <button 
          onClick={() => onBook(event)} 
          className={`btn ${isSoldOut ? 'btn-secondary' : 'btn-primary'} card-btn`}
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Sold Out' : 'Book Passes'}
          {!isSoldOut && <ArrowRight size={16} className="btn-icon" />}
        </button>
      </div>

      <style>{`
        .event-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .event-card:hover .card-image {
          transform: scale(1.08);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: var(--gradient-card-overlay);
        }

        .card-badge-container {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge-price {
          background: rgba(10, 7, 18, 0.8);
          backdrop-filter: blur(4px);
          color: #fff;
          border: 1px solid var(--border-glass);
          font-weight: 700;
          font-size: 0.8rem;
        }

        .card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-title {
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-glass);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .ticket-progress-wrapper {
          margin-bottom: 20px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 6px;
          color: var(--text-secondary);
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remaining-text {
          font-weight: 600;
          color: var(--color-primary);
        }

        .progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .progress-bar.urgent {
          background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-danger) 100%);
        }

        .card-btn {
          width: 100%;
          margin-top: auto;
        }

        .btn-icon {
          transition: transform var(--transition-fast);
        }

        .event-card:hover .btn-icon {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};

export default EventCard;
