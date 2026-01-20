import express from "express";
import { config } from "./config/env";
import cors from "cors";
import morgan from "morgan";
import appV1Routes from "./routes/api/v1/index";
import db from "./config/db";
import { errorHandlerMiddleware } from "./middleware/errorHandler.middleware";

const app = express();
db;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  config.frontenUrl,
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
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

app.use(morgan("dev"));

app.use("/api/v1", appV1Routes);

//error handler middleware
app.use(errorHandlerMiddleware);

//for unknown routes give 404 page not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

app.listen(config.port, (err) => {
  if (err) {
    console.error(`Error in starting the server.`);
  }
  console.log(
    `Server running on port : ${config.port} in ${config.nodeEnv} environment`,
  );
});
