import mongoose from "mongoose";

// 1. Define the interface for type safety
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 2. Extend global namespace with mongoose cache
declare global {
  var mongoose: MongooseCache;
}

const MONGO_URI = process.env.MONGO_URI as string; // Standard naming convention

if (!MONGO_URI) {
  throw new Error("❌ Please define MONGODB_URI in your .env file");
}

// 3. Define the cached
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) {
    console.log(" ✅  Using Existing Connection");
    return cached.conn;
  }

  // CASE-2 When Connection doesn't exist so we check promise
  if (!cached.promise) {
    // means connection was never called it's first attemp and send a promise and establish a connection

    //Define options

    const opts = {
      bufferCommands: false, // disable mongoose buffering
      serverSelectionTimeoutMS: 10000, //timeout after 5 seconds
      socketTimeoutMS: 45000,
      dbName: "spotLens",
    };
    // Store Raw promise not await - resolve the promise first and build a connection
    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log("✨ New MongoDB Connection Established ");
        return mongooseInstance;
      })
      .catch((err) => {
        //Reset Promise value on the connection establishment failure
        cached.promise = null;
        throw new Error(`DB Connection Failed, ${err.message}`);
      });

    // Promise is resolved we have connection now so AWAIT NOW to give the conn a mongoseeInstance to store the connection
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset both promise and conn value
    cached.conn = null;
    cached.promise = null;
    console.error("Can't resolve the promise :/", error);
    throw error;
  }

  //to prevent memory leaks and also add thr hot reload
  if (process.env.NODE_ENV === "development") {
    global.mongoose = cached;
  }

  // Now with the try catch block I have the value in the cached.conn so now I can say yes the connection is established and in other files we can use the connections
  // basically the connectDB() -> will use this connection string to connect with the database
  return cached.conn;
}
