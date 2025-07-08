import { Schema, model } from "mongoose";

//upvote or downvote? which pin? which user

interface IVote {
  //Type of vote - upvote or downvote

  value: 1 | -1;
  userId: string;
  pinId: string;
}

const VoteSchema = new Schema(
  {
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    pinId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Avoid duplication
VoteSchema.index({ pinId: 1, userId: 1 }, { unique: true });

export const Vote = model<IVote>("Vote", VoteSchema);
