const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;
const DATA_FILE = 'data.json';

app.use(express.json());
app.use(cors());

// Load reviews or initialize empty object
const loadReviews = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {}; // Empty if file doesn't exist
  }
};

// Save reviews to data.json
const saveReviews = (reviews) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2));
};

// API to submit a review
app.post('/submit-review', (req, res) => {
  const { text, location, lat, lng } = req.body;

  if (!text || !location || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reviews = loadReviews();
  const locationKey = `${lng}-${lat}`;

  if (!reviews[locationKey]) {
    reviews[locationKey] = [];
  }

  const newReview = { text, location, lat, lng, timestamp: new Date() };
  reviews[locationKey].push(newReview);

  saveReviews(reviews);
  res.json({ message: 'Review saved successfully!', review: newReview });
});

// API to fetch all reviews
app.get('/reviews', (req, res) => {
  const reviews = loadReviews();
  res.json(reviews);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
