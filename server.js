const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(express.json());
app.use(cors());

// Temporary storage (Map) with TTL (1 hour = 3600000ms)
const reviews = new Map();
const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to auto-delete reviews after expiration time
const setExpiration = (key) => {
  setTimeout(() => {
    reviews.delete(key);
    console.log(`🗑️ Expired reviews for location: ${key}`);
  }, EXPIRATION_TIME);
};

// 📨 Submit a Review
app.post('/submit-review', (req, res) => {
  const { text, location, lat, lng } = req.body;

  if (!text || !location || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const locationKey = `${lng}-${lat}`;

  if (!reviews.has(locationKey)) {
    reviews.set(locationKey, []);
  }

  const newReview = { text, location, lat, lng, timestamp: new Date() };
  reviews.get(locationKey).push(newReview);

  // Set expiration for this location
  if (reviews.get(locationKey).length === 1) {
    setExpiration(locationKey);
  }

  res.json({ message: '✅ Review saved successfully!', review: newReview });
});

// 📜 Get All Reviews
app.get('/reviews', (req, res) => {
  const allReviews = Object.fromEntries(reviews); // Convert Map to Object
  res.json(allReviews);
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// ⚡ Vercel config (for API routing)
module.exports = app;
