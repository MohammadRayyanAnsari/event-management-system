const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events - Get all events (optionally filtered by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const events = await Event.find(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving events', error: error.message });
  }
});

// GET /api/events/:id - Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event', error: error.message });
  }
});

// POST /api/events - Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, location, price, category, capacity, imageUrl } = req.body;
    
    // Simple validation
    if (!title || !description || !date || !time || !location || price === undefined || !category || !capacity) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      time,
      location,
      price: Number(price),
      category,
      capacity: Number(capacity),
      imageUrl
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

module.exports = router;
