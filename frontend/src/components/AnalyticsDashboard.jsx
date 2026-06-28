import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Users, Calendar, Ticket, CheckSquare, RefreshCw } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to load analytics dashboard data');
      }
      const json = await response.ok ? await response.json() : null;
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw className="loading-spinner" size={40} />
        <p>Assembling real-time metrics ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card error-card">
        <h3>Analytics Fetch Error</h3>
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  const { summary, eventSales, categoryStats, revenueStream } = data;

  // Chart 1: Revenue Stream over Time (Line Chart)
  const lineChartData = {
    labels: revenueStream.map(d => d.date),
    datasets: [
      {
        fill: true,
        label: 'Cumulative Revenue ($)',
        data: revenueStream.map(d => d.revenue),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  // Chart 2: Ticket Sales and Capacity by Event (Bar Chart)
  const barChartData = {
    labels: eventSales.map(e => e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title),
    datasets: [
      {
        label: 'Tickets Sold',
        data: eventSales.map(e => e.bookedTickets),
        backgroundColor: 'rgba(236, 72, 153, 0.85)',
        borderRadius: 6
      },
      {
        label: 'Event Capacity',
        data: eventSales.map(e => e.capacity),
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // Chart 3: Check-in / Gate Attendance Rate (Doughnut)
  const unchecked = Math.max(0, summary.totalTicketsSold - summary.totalCheckins);
  const doughnutChartData = {
    labels: ['Checked In', 'Absent / Pending'],
    datasets: [
      {
        data: [summary.totalCheckins, unchecked],
        backgroundColor: ['#10b981', 'rgba(255, 255, 255, 0.05)'],
        borderColor: ['rgba(16, 185, 129, 0.3)', 'rgba(255, 255, 255, 0.08)'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#120e24',
        titleFont: { family: 'Outfit', weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.02)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.02)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', weight: '600', size: 11 }
        }
      }
    }
  };

  return (
    <div className="analytics-layout">
      {/* Title */}
      <div className="analytics-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Real-time ticket ledger, financial streams, and gate attendance metrics.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-outline btn-refresh">
          <RefreshCw size={16} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon-box rev">
            <TrendingUp size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Gross Revenue</span>
            <h3 className="metric-val">${summary.totalRevenue.toLocaleString()}</h3>
            <span className="metric-sub text-success">Incoming Funds</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box ticket">
            <Ticket size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Tickets Issued</span>
            <h3 className="metric-val">{summary.totalTicketsSold.toLocaleString()}</h3>
            <span className="metric-sub">Across all events</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box checkin">
            <CheckSquare size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Gate Check-ins</span>
            <h3 className="metric-val">{summary.totalCheckins.toLocaleString()}</h3>
            <span className="metric-sub text-success">{summary.attendanceRate}% Attendance Rate</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box events">
            <Calendar size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Events</span>
            <h3 className="metric-val">{summary.totalEventsCount}</h3>
            <span className="metric-sub">Published directories</span>
          </div>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="charts-main-grid">
        <div className="glass-card chart-card span-two-cols">
          <h4>Revenue Growth Stream</h4>
          <div className="chart-wrapper">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card chart-card">
          <h4>Gate Attendance Ratio</h4>
          <div className="chart-wrapper doughnut-adjust">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
          <div className="doughnut-center-stat">
            <span className="mid-num">{summary.attendanceRate}%</span>
            <span className="mid-lbl">Checked In</span>
          </div>
        </div>

        <div className="glass-card chart-card span-three-cols">
          <h4>Ticket Allocations per Event</h4>
          <div className="chart-wrapper">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Event Details Ledger Table */}
      <div className="glass-card table-card">
        <h4>Detailed Event Ledger</h4>
        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Tickets Sold</th>
                <th>Capacity</th>
                <th>Sales Ratio</th>
                <th>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {eventSales.map((item, idx) => {
                const ratio = Math.round((item.bookedTickets / item.capacity) * 100);
                return (
                  <tr key={idx}>
                    <td className="font-bold">{item.title}</td>
                    <td><span className="badge badge-category">{item.category}</span></td>
                    <td>${item.price}</td>
                    <td>{item.bookedTickets}</td>
                    <td>{item.capacity}</td>
                    <td>
                      <div className="table-progress-wrapper">
                        <span>{ratio}%</span>
                        <div className="table-progress-track">
                          <div 
                            className={`table-progress-bar ${ratio > 80 ? 'full' : ''}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-bold text-success">${item.revenue.toLocaleString()}</td>
                  </tr>
                );
              })}
              {eventSales.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No event sales records available in ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-layout {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .btn-refresh {
          padding: 10px 18px;
          font-size: 0.85rem;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 0;
          gap: 16px;
          color: var(--text-secondary);
        }

        .loading-spinner {
          color: var(--color-primary);
          animation: spin 1.2s linear infinite;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .metric-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .metric-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
        }

        .metric-icon-box.rev {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .metric-icon-box.ticket {
          background: rgba(236, 72, 153, 0.1);
          color: #f472b6;
          border: 1px solid rgba(236, 72, 153, 0.2);
        }

        .metric-icon-box.checkin {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .metric-icon-box.events {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .metric-content {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .metric-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          line-height: 1.1;
          margin: 4px 0;
        }

        .metric-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .charts-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .chart-card {
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-card h4 {
          font-size: 1rem;
          color: var(--text-primary);
          border-left: 3px solid var(--color-primary);
          padding-left: 8px;
        }

        .chart-wrapper {
          height: 260px;
          width: 100%;
          position: relative;
        }

        .doughnut-adjust {
          height: 220px;
        }

        .doughnut-center-stat {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -30%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .doughnut-center-stat .mid-num {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
        }

        .doughnut-center-stat .mid-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .span-two-cols {
          grid-column: span 1;
        }

        .span-three-cols {
          grid-column: span 2;
        }

        /* Table ledger */
        .table-card {
          padding: 24px;
        }

        .table-card h4 {
          font-size: 1rem;
          margin-bottom: 20px;
          border-left: 3px solid var(--color-primary);
          padding-left: 8px;
        }

        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }

        .ledger-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .ledger-table th {
          padding: 12px 16px;
          color: var(--text-muted);
          font-weight: 700;
          border-bottom: 1px solid var(--border-glass);
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.5px;
        }

        .ledger-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-secondary);
        }

        .ledger-table tr:last-child td {
          border-bottom: none;
        }

        .font-bold {
          font-weight: 700;
          color: white !important;
        }

        .table-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-progress-track {
          width: 60px;
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .table-progress-bar {
          height: 100%;
          background: var(--color-primary);
        }

        .table-progress-bar.full {
          background: var(--color-secondary);
        }

        @media (max-width: 992px) {
          .charts-main-grid {
            grid-template-columns: 1fr;
          }
          .span-three-cols {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
