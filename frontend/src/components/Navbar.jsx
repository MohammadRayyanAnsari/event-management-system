import React from 'react';
import { Calendar, PlusCircle, BarChart3, ScanLine, Ticket, Layers } from 'lucide-react';

const Navbar = ({ currentView, onViewChange, userEmail }) => {
  const navItems = [
    { id: 'events', label: 'Discover', icon: Calendar },
    { id: 'create', label: 'Organize', icon: PlusCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'scanner', label: 'Gate Check-in', icon: ScanLine },
    { id: 'tickets', label: 'My Tickets', icon: Ticket }
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onViewChange('events')}>
          <div className="brand-icon">
            <Layers size={24} className="icon-glow" />
          </div>
          <span className="brand-text">Aura<span className="gradient-text">Events</span></span>
        </div>

        <nav className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <Icon size={18} />
                <span className="nav-text">{item.label}</span>
                {isActive && <span className="nav-indicator" />}
              </button>
            );
          })}
        </nav>

        {userEmail && (
          <div className="navbar-user">
            <div className="user-dot"></div>
            <span className="user-email" title={userEmail}>
              {userEmail.split('@')[0]}
            </span>
          </div>
        )}
      </div>

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 7, 18, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-glass);
          padding: 14px 24px;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
        }

        .brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.3);
        }

        .icon-glow {
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.5));
        }

        .brand-text {
          letter-spacing: -0.5px;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px;
          border-radius: 99px;
          border: 1px solid var(--border-glass);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 99px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-normal);
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: #fff;
          background: var(--bg-surface-elevated);
          box-shadow: var(--shadow-sm);
        }

        .nav-indicator {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #34d399;
          max-width: 180px;
        }

        .user-dot {
          width: 6px;
          height: 6px;
          background: var(--color-success);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--color-success);
        }

        .user-email {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column;
            gap: 12px;
          }
          .navbar-nav {
            width: 100%;
            overflow-x: auto;
            justify-content: space-between;
          }
          .nav-text {
            display: none;
          }
          .navbar-user {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
