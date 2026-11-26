import mongoose from "mongoose";

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    const error = new Error("Missing MONGODB_URI in environment variables.");
    console.error("MongoDB connection failed:", error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  try {
    if (!connectionPromise) {
      connectionPromise = mongoose
        .connect(process.env.MONGODB_URI, {
          maxPoolSize: 30,
          minPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
        })
        .then((conn) => {
          cachedConnection = conn;
          console.log(`MongoDB Connected: ${conn.connection.host}`);
          return conn;
        });
    }

    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    cachedConnection = null;
    console.error("MongoDB connection failed:", error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;