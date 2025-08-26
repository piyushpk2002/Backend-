import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    businessName: { type: String, required: true },
    overallRating: { type: Number, required: true },
    reviewTitle: { type: String, required: true },
    reviewText: { type: String },
    recommendFriend: { type: Boolean, required: true },
    nickname: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
