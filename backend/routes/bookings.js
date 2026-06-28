const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// POST /api/bookings - Purchase tickets (includes mock payment verification)
router.post('/', async (req, res) => {
  try {
    const { eventId, customerName, customerEmail, ticketsCount, paymentMethod, cardDetails } = req.body;

    if (!eventId || !customerName || !customerEmail || !ticketsCount || !paymentMethod) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    // 1. Fetch Event and check capacity
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const requestedTickets = Number(ticketsCount);
    if (event.bookedTickets + requestedTickets > event.capacity) {
      return res.status(400).json({ 
        message: `Booking failed. Only ${event.capacity - event.bookedTickets} tickets remaining.` 
      });
    }

    // Check ticket booking limit per email (maximum 10 tickets per event)
    const existingBookings = await Booking.find({ eventId, customerEmail });
    const totalAlreadyBooked = existingBookings.reduce((sum, b) => sum + b.ticketsCount, 0);
    if (totalAlreadyBooked + requestedTickets > 10) {
      return res.status(400).json({ 
        message: `Booking failed. You have already booked ${totalAlreadyBooked} ticket(s) for this event. You can book at most ${10 - totalAlreadyBooked} more.` 
      });
    }

    // 2. Validate payment based on method
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.cardNumber) {
        return res.status(400).json({ message: 'Card details are required for card payments.' });
      }
      
      // Clean and validate card number (must be exactly 16 digits)
      const cleanCard = cardDetails.cardNumber.replace(/\D/g, ''); // Remove spaces/symbols
      if (cleanCard.length !== 16) {
        return res.status(400).json({ message: 'Payment validation failed: Credit Card must be exactly 16 digits.' });
      }
    } else if (paymentMethod === 'qr') {
      // For QR, it is simulated. The user clicked "continue to payment" after scan
      // No extra checks required, but we confirm it's accepted.
    } else {
      return res.status(400).json({ message: 'Invalid payment method selected.' });
    }

    // Calculate total price
    const totalPaid = event.price * requestedTickets;

    // Generate unique QR code data
    const ticketQRCode = 'qr_tkt_' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36).toUpperCase();

    // 3. Create booking
    const booking = await Booking.create({
      eventId,
      customerName,
      customerEmail,
      ticketsCount: requestedTickets,
      totalPaid,
      paymentMethod,
      paymentStatus: 'success',
      ticketQRCode
    });

    // 4. Update event's booked ticket count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { bookedTickets: requestedTickets }
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error processing booking', error: error.message });
  }
});

// GET /api/bookings - Get user bookings (filtered by email)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required.' });
    }
    
    let bookings;
    if (email === 'all') {
      bookings = await Booking.find({});
    } else {
      bookings = await Booking.find({ customerEmail: email });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving booking details', error: error.message });
  }
});

// POST /api/bookings/checkin - Perform QR check-in
router.post('/checkin', async (req, res) => {
  try {
    const { ticketQRCode } = req.body;
    if (!ticketQRCode) {
      return res.status(400).json({ message: 'Ticket QR Code data is required.' });
    }

    // Find booking
    const booking = await Booking.findOne({ ticketQRCode });
    if (!booking) {
      return res.status(404).json({ message: 'Invalid ticket. No booking found for this QR code.' });
    }

    if (booking.checkInStatus) {
      return res.status(400).json({ 
        message: 'Already Checked In', 
        booking 
      });
    }

    // Mark as checked in
    const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
      $set: { checkInStatus: true }
    });

    res.json({
      message: 'Check-in successful! Welcome to the event.',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing check-in', error: error.message });
  }
});

module.exports = router;
