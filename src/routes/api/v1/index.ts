import express from "express";
import performanceRoutes from "./performance.routes";

const routes = express.Router();

routes.get("/", (req, res) => {
  return res
    .status(200)
    .send({ message: "Backend Server is up and running.", success: true });
});

// Use performance review routes
routes.use("/performance", performanceRoutes);

export default routes;
