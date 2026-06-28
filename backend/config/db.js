const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isFallbackMode = false;
const fallbackFilePath = path.join(__dirname, '..', 'db_fallback.json');

// Ensure fallback file exists
if (!fs.existsSync(fallbackFilePath)) {
  fs.writeFileSync(fallbackFilePath, JSON.stringify({ events: [], bookings: [] }, null, 2));
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Timeout quickly so user doesn't wait
    });
    console.log('MongoDB Connected Successfully.');
    isFallbackMode = false;
  } catch (err) {
    console.warn('\n==================================================================');
    console.warn('⚠️  MONGODB CONNECTION FAILED:');
    console.warn(`   ${err.message}`);
    console.warn('   The system will automatically fallback to Local JSON Database.');
    console.warn(`   Local Database File: ${fallbackFilePath}`);
    console.warn('==================================================================\n');
    isFallbackMode = true;
  }
};

const getFallbackData = () => {
  try {
    const raw = fs.readFileSync(fallbackFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { events: [], bookings: [] };
  }
};

const saveFallbackData = (data) => {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving fallback data:', err.message);
  }
};

module.exports = {
  connectDB,
  isFallbackMode: () => isFallbackMode,
  getFallbackData,
  saveFallbackData
};
