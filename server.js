const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.5uyl0.mongodb.net/reviews_db?retryWrites=true&w=majority`;

let cachedDb = null; // Prevent re-connecting on each request

async function connectDB() {
  if (cachedDb) return cachedDb;
  try {
    cachedDb = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
    return cachedDb;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    throw err;
  }
}

// Define Review Schema
const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

// API Routes
app.post("/submit-review", async (req, res) => {
  await connectDB();
  const { text, location, lat, lng } = req.body;
  if (!text || !location || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newReview = new Review({ text, location, lat, lng });
  await newReview.save();
  res.json({ message: "✅ Review saved successfully!", review: newReview });
});

app.get("/reviews", async (req, res) => {
  await connectDB();
  const allReviews = await Review.find();
  res.json(allReviews);
});

// **Vercel Serverless Function Export**
module.exports = app;
