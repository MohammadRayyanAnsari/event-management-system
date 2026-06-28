const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// GET /api/analytics - Get summary dashboard analytics
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({});
    const bookings = await Booking.find({});

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalCheckins = 0;

    bookings.forEach(b => {
      totalRevenue += b.totalPaid || 0;
      totalTicketsSold += b.ticketsCount || 0;
      if (b.checkInStatus) {
        totalCheckins += b.ticketsCount || 0;
      }
    });

    const totalEventsCount = events.length;
    const attendanceRate = totalTicketsSold > 0 ? Math.round((totalCheckins / totalTicketsSold) * 100) : 0;

    // Compile event-level stats
    const eventSalesMap = {};
    events.forEach(e => {
      eventSalesMap[e._id] = {
        id: e._id,
        title: e.title,
        price: e.price,
        capacity: e.capacity,
        bookedTickets: 0,
        revenue: 0,
        category: e.category
      };
    });

    bookings.forEach(b => {
      // b.eventId could be a populated object or a simple string ID depending on DB layer.
      const idVal = (b.eventId && b.eventId._id) ? b.eventId._id : b.eventId;
      if (eventSalesMap[idVal]) {
        eventSalesMap[idVal].bookedTickets += b.ticketsCount;
        eventSalesMap[idVal].revenue += b.totalPaid;
      }
    });

    const eventSales = Object.values(eventSalesMap);

    // Compile category-level stats
    const categoryStatsMap = {};
    eventSales.forEach(es => {
      if (!categoryStatsMap[es.category]) {
        categoryStatsMap[es.category] = { category: es.category, revenue: 0, ticketsSold: 0, eventCount: 0 };
      }
      categoryStatsMap[es.category].revenue += es.revenue;
      categoryStatsMap[es.category].ticketsSold += es.bookedTickets;
      categoryStatsMap[es.category].eventCount += 1;
    });
    const categoryStats = Object.values(categoryStatsMap);

    // Compile daily revenue stream (ordered by date)
    const dailyRevenueMap = {};
    bookings.forEach(b => {
      const dateObj = new Date(b.createdAt);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyRevenueMap[dateStr] = (dailyRevenueMap[dateStr] || 0) + b.totalPaid;
    });

    // Simple sorting by approximate date string order
    const sortedDates = Object.keys(dailyRevenueMap).sort((a, b) => new Date(a) - new Date(b));
    const revenueStream = sortedDates.map(date => ({
      date,
      revenue: dailyRevenueMap[date]
    }));

    // If empty stream, seed empty state
    if (revenueStream.length === 0) {
      revenueStream.push({ date: 'No Sales', revenue: 0 });
    }

    res.json({
      summary: {
        totalRevenue,
        totalTicketsSold,
        totalEventsCount,
        totalCheckins,
        attendanceRate
      },
      eventSales,
      categoryStats,
      revenueStream
    });

  } catch (error) {
    res.status(500).json({ message: 'Error compiling analytics', error: error.message });
  }
});

module.exports = router;
