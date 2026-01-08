import express from "express";
import db from "./config/db";
import { config } from "./config/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";

const app = express();
const PORT = config.port;

db;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  config.frontendUrl,
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (
      (typeof origin === "string" && allowedOrigins.indexOf(origin) !== -1) ||
      !origin
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//application routes would go here

// Global error handling middleware
app.use(errorHandlerMiddleware);

// 404 handler - for routes that don't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
