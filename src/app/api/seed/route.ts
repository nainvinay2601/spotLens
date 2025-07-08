// app/api/seed/route.ts
import { NextResponse } from "next/server";
import { User, Pin, Vote, Review } from "@/models";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany(), 
      Pin.deleteMany(),
      Vote.deleteMany(),
      Review.deleteMany()
    ]);

    // Seed test user
    const user = await User.create({
      clerkId: "test-user-123",
      email: "test@example.com",
      username: "tester123"
    });

    // Seed second test user
    const user2 = await User.create({
      clerkId: "test-user-456",
      email: "test2@example.com",
      username: "reviewer456"
    });

    // Seed test pin
    const pin = await Pin.create({
      title: "Broken Sidewalk",
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061], // NYC
      },
      userId: user.clerkId,
      category: "danger",
      description: "Large crack in the sidewalk that could cause trips"
    });

    // Seed second test pin
    const pin2 = await Pin.create({
      title: "Pothole Alert",
      location: {
        type: "Point",
        coordinates: [-73.985130, 40.758896], // Times Square area
      },
      userId: user2.clerkId,
      category: "utility",
      description: "Deep pothole on 7th Avenue"
    });

    // Seed votes
    await Vote.create([
      {
        userId: user.clerkId,
        pinId: pin._id,
        value: 1 // upvote
      },
      {
        userId: user2.clerkId,
        pinId: pin._id,
        value: 1 // upvote
      },
      {
        userId: user.clerkId,
        pinId: pin2._id,
        value: -1 // downvote
      }
    ]);

    // Seed reviews
    await Review.create([
      {
        userId: user2.clerkId,
        pinId: pin._id,
        rating: 4,
        content: "This is definitely a hazard! Thanks for reporting."
      },
      {
        userId: user.clerkId,
        pinId: pin2._id,
        rating: 2,
        content: "Not as bad as described, but still needs fixing"
      }
    ]);

    return NextResponse.json({
      status: "🌱 Database fully seeded!",
      counts: {
        users: await User.countDocuments(),
        pins: await Pin.countDocuments(),
        votes: await Vote.countDocuments(),
        reviews: await Review.countDocuments()
      },
      message: "Created 2 users, 2 pins, 3 votes, and 2 reviews"
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Seeding failed", details: err.message },
      { status: 500 }
    );
  }
}