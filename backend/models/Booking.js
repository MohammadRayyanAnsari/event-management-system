const mongoose = require('mongoose');
const { isFallbackMode, getFallbackData, saveFallbackData } = require('../config/db');
const Event = require('./Event');

const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  ticketsCount: { type: Number, required: true },
  totalPaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'qr'], required: true },
  paymentStatus: { type: String, default: 'success' },
  checkInStatus: { type: Boolean, default: false },
  ticketQRCode: { type: String, required: true, unique: true }
}, { timestamps: true });

let MongoBooking;
try {
  MongoBooking = mongoose.model('Booking', BookingSchema);
} catch (e) {
  MongoBooking = mongoose.model('Booking');
}

// Generate simple unique ID
function generateId(prefix = 'bkg_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

const BookingWrapper = {
  find: async (query = {}) => {
    if (!isFallbackMode()) {
      return await MongoBooking.find(query).populate('eventId');
    }
    const data = getFallbackData();
    let results = data.bookings;
    
    // Support filtering by customerEmail or eventId
    if (query.customerEmail) {
      results = results.filter(b => b.customerEmail.toLowerCase() === query.customerEmail.toLowerCase());
    }
    if (query.eventId) {
      results = results.filter(b => b.eventId === query.eventId);
    }
    if (query.ticketQRCode) {
      results = results.filter(b => b.ticketQRCode === query.ticketQRCode);
    }

    // Mimic Mongoose populate('eventId')
    const populatedResults = [];
    for (const booking of results) {
      const eventDetails = data.events.find(e => e._id === booking.eventId);
      populatedResults.push({
        ...booking,
        eventId: eventDetails || { _id: booking.eventId, title: 'Unknown Event', price: 0 }
      });
    }
    return populatedResults;
  },

  findOne: async (query = {}) => {
    if (!isFallbackMode()) {
      return await MongoBooking.findOne(query).populate('eventId');
    }
    const list = await BookingWrapper.find(query);
    return list.length > 0 ? list[0] : null;
  },

  findById: async (id) => {
    if (!isFallbackMode()) {
      return await MongoBooking.findById(id).populate('eventId');
    }
    const data = getFallbackData();
    const booking = data.bookings.find(b => b._id === id);
    if (!booking) return null;
    
    const eventDetails = data.events.find(e => e._id === booking.eventId);
    return {
      ...booking,
      eventId: eventDetails || { _id: booking.eventId, title: 'Unknown Event', price: 0 }
    };
  },

  create: async (bookingData) => {
    if (!isFallbackMode()) {
      // For mongoose, ensure we save and return populated event
      const doc = new MongoBooking(bookingData);
      await doc.save();
      return await MongoBooking.findById(doc._id).populate('eventId');
    }
    const data = getFallbackData();
    const newBooking = {
      _id: generateId(),
      eventId: bookingData.eventId,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      ticketsCount: Number(bookingData.ticketsCount),
      totalPaid: Number(bookingData.totalPaid),
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: bookingData.paymentStatus || 'success',
      checkInStatus: false,
      ticketQRCode: bookingData.ticketQRCode || generateId('qr_'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.bookings.push(newBooking);
    saveFallbackData(data);
    
    // Return populated
    const eventDetails = data.events.find(e => e._id === newBooking.eventId);
    return {
      ...newBooking,
      eventId: eventDetails || { _id: newBooking.eventId, title: 'Unknown Event', price: 0 }
    };
  },

  findByIdAndUpdate: async (id, update, options = {}) => {
    if (!isFallbackMode()) {
      return await MongoBooking.findByIdAndUpdate(id, update, options).populate('eventId');
    }
    const data = getFallbackData();
    const index = data.bookings.findIndex(b => b._id === id);
    if (index === -1) return null;

    let updatedBooking = { ...data.bookings[index] };
    
    if (update.$set) {
      updatedBooking = { ...updatedBooking, ...update.$set };
    } else {
      updatedBooking = { ...updatedBooking, ...update };
    }

    updatedBooking.updatedAt = new Date().toISOString();
    data.bookings[index] = updatedBooking;
    saveFallbackData(data);

    const eventDetails = data.events.find(e => e._id === updatedBooking.eventId);
    return {
      ...updatedBooking,
      eventId: eventDetails || { _id: updatedBooking.eventId, title: 'Unknown Event', price: 0 }
    };
  }
};

module.exports = BookingWrapper;
