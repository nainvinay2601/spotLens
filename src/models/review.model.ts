import { Schema, model } from "mongoose";

interface IReview {
  content: string;
  rating: number;
  pinId: string; // review for which one
  userId: string; //clerk user id
}

const ReviewSchema = new Schema<IReview>(
  {
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    pinId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = model<IReview>("Review", ReviewSchema);
