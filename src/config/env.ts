import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "Production",
  port: process.env.PORT ?? 4040,
  frontenUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  dbURL: process.env.MONGO_URI,
  geminiAPI: process.env.GEMINI_API_KEY,
};
