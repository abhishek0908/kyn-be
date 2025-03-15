const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Get MongoDB credentials from environment variables
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Ensure credentials are set
if (!MONGO_USERNAME || !MONGO_PASSWORD) {
  console.error('❌ MongoDB username or password is missing. Set them as environment variables.');
  process.exit(1);
}

// Construct MongoDB connection URI
const MONGO_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.5uyl0.mongodb.net/reviews_db?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define Review Schema
const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

const Review = mongoose.model('Review', reviewSchema);

app.use(express.json());
app.use(cors());

// 📨 Submit a Review
app.post('/submit-review', async (req, res) => {
  try {
    const { text, location, lat, lng } = req.body;

    if (!text || !location || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newReview = new Review({ text, location, lat, lng });
    await newReview.save();

    res.json({ message: '✅ Review saved successfully!', review: newReview });
  } catch (error) {
    console.error('❌ Error saving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 📜 Get All Reviews
app.get('/reviews', async (req, res) => {
  try {
    const allReviews = await Review.find();
    res.json(allReviews);
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

module.exports = app;
