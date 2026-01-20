import express from "express";

const routes = express.Router();

routes.get("/", (req, res) => {
  return res
    .status(200)
    .send({ message: "Backend Server is up and running.", success: true });
});

export default routes;
