const mongoose = require('mongoose');
const { isFallbackMode, getFallbackData, saveFallbackData } = require('../config/db');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  capacity: { type: Number, required: true },
  bookedTickets: { type: Number, default: 0 },
  imageUrl: { type: String }
}, { timestamps: true });

let MongoEvent;
try {
  MongoEvent = mongoose.model('Event', EventSchema);
} catch (e) {
  MongoEvent = mongoose.model('Event');
}

// Generate simple unique ID for fallback
function generateId() {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

const EventWrapper = {
  find: async (query = {}) => {
    if (!isFallbackMode()) {
      return await MongoEvent.find(query);
    }
    const data = getFallbackData();
    let results = data.events;
    
    // Support basic filters
    if (query.category && query.category !== 'All') {
      results = results.filter(e => e.category.toLowerCase() === query.category.toLowerCase());
    }
    
    return results;
  },

  findById: async (id) => {
    if (!isFallbackMode()) {
      return await MongoEvent.findById(id);
    }
    const data = getFallbackData();
    const event = data.events.find(e => e._id === id);
    return event || null;
  },

  create: async (eventData) => {
    if (!isFallbackMode()) {
      return await MongoEvent.create(eventData);
    }
    const data = getFallbackData();
    const newEvent = {
      _id: generateId(),
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      price: Number(eventData.price),
      category: eventData.category,
      capacity: Number(eventData.capacity),
      bookedTickets: 0,
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.events.push(newEvent);
    saveFallbackData(data);
    return newEvent;
  },

  findByIdAndUpdate: async (id, update, options = {}) => {
    if (!isFallbackMode()) {
      return await MongoEvent.findByIdAndUpdate(id, update, options);
    }
    const data = getFallbackData();
    const index = data.events.findIndex(e => e._id === id);
    if (index === -1) return null;

    let updatedEvent = { ...data.events[index] };
    
    if (update.$inc) {
      for (const key in update.$inc) {
        updatedEvent[key] = (updatedEvent[key] || 0) + update.$inc[key];
      }
    }
    if (update.$set) {
      updatedEvent = { ...updatedEvent, ...update.$set };
    } else if (!update.$inc && !update.$set) {
      updatedEvent = { ...updatedEvent, ...update };
    }

    updatedEvent.updatedAt = new Date().toISOString();
    data.events[index] = updatedEvent;
    saveFallbackData(data);
    return updatedEvent;
  }
};

module.exports = EventWrapper;
