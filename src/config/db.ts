import mongoose from "mongoose";
import { config } from "./env";

mongoose.connect(config.dbURL as string);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error in connecting with DB"));
db.once("open", () => {
  console.log("Connection with database established");
});

export default db;
