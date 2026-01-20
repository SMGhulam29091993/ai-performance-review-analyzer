import express from "express";
import { config } from "./config/env";

const app = express();

app.listen(config.port, (err) => {
  if (err) {
    console.error(`Error in starting the server.`);
  }
  console.log(`Server running on port : ${config.port}`);
});
