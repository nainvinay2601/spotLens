import { Schema, model } from "mongoose";

//Define the types

interface IPin {
  title: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  userId: string; // will take the clerkId defined in the User
  category:
    | "danger"
    | "must-visit"
    | "nightlife"
    | "utility"
    | "food"
    | "transportation";
  imageUrl?: string;
  status: "active" | "archived";
}

// Define PinSchema now
const PinSchema = new Schema<IPin>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: {
      type: { type: String, default: "Point", required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v: number[]) {
            return v.length === 2;
          },
          message:"location must contain exactly 2 numbers"
        },
      }, // [lng, lat]
    },
    userId: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "danger",
        "must-visit",
        "nightlife",
        "utility",
        "food",
        "transportation",
      ],
      required: true,
      default: "utility", // if nothing specifed
    },
    imageUrl: String,
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

//Geo Spatial indexing for proximity as single coordinate based can miss the nearby
PinSchema.index({ location: "2dsphere" });

export const Pin = model<IPin>("Pin", PinSchema);
