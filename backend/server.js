require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, isFallbackMode, getFallbackData, saveFallbackData } = require('./config/db');

// Models for seed check
const Event = require('./models/Event');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: isFallbackMode() ? 'Fallback JSON' : 'MongoDB'
  });
});

// Seed data function
const seedInitialData = async () => {
  try {
    const events = await Event.find({});
    if (events.length === 0) {
      console.log('No events found. Seeding initial professional events...');
      const sampleEvents = [
        {
          title: 'TechNexus Summit 2026',
          description: 'Join industry pioneers, developers, and designers for a two-day deep dive into Next-Gen Web Technologies, AI integrations, and computing architectures.',
          date: '2026-09-12',
          time: '09:00',
          location: 'San Francisco Innovation Center, CA',
          price: 189,
          category: 'Technology',
          capacity: 150,
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Harmony Music Festival',
          description: 'Experience an unforgettable weekend of indie bands, modern folk acts, and digital synthesists in a premium outdoor setting with visual mapping.',
          date: '2026-07-24',
          time: '16:00',
          location: 'Sunset Meadows Park, Austin TX',
          price: 65,
          category: 'Entertainment',
          capacity: 400,
          imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Stellar Culinary Showcase',
          description: 'A curated tasting experience pairing multi-course plates by Michelin-starred chefs with global vintages, featuring interactive cooking workshops.',
          date: '2026-08-05',
          time: '18:30',
          location: 'The Downtown Glasshouse, Chicago IL',
          price: 130,
          category: 'Food & Drink',
          capacity: 80,
          imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Horizon Art & Design Expo',
          description: 'Exploring the intersection of architectural geometry, responsive projection art, and physical sculpting by upcoming global design visionaries.',
          date: '2026-10-19',
          time: '10:00',
          location: 'Metropolitan Gallery of Art, NY',
          price: 35,
          category: 'Arts & Culture',
          capacity: 250,
          imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80'
        }
      ];

      for (const item of sampleEvents) {
        await Event.create(item);
      }
      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Failed to seed database:', err.message);
  }
};

// Start Server
const startServer = async () => {
  // Initialize Database connection
  await connectDB();
  
  // Seed sample events
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
    console.log(`Database Mode: ${isFallbackMode() ? 'Local JSON (FALLBACK)' : 'MongoDB (CONNECTED)'}`);
  });
};

startServer();
