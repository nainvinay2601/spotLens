import { Schema, model } from "mongoose";

// declare the types of the data/ entity which will be present in the data model

interface IUser {
  clerkId: string;
  email: string;
  username?: string;
  profileImage?: string;
  role?: "user" | "admin";
}

// Now types are defined so we define the userSchema

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: String,
    profileImage: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", UserSchema);
