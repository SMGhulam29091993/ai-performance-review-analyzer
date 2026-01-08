import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/performance_reviewer"
);
const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});
export default db;
