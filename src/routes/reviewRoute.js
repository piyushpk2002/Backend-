import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

//review Route
router.post("/create", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ message: "Review submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// recently review Route
router.get("/recent", async (req, res) => {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 }).limit(6); // get latest 6 reviews
      res.json({ reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  

export default router;
