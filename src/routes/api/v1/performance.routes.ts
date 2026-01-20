import express from "express";
import multer from "multer";
import { performanceReviewController } from "../../../controller/performance.controller";
import { zodValidator } from "../../../middleware/zodValidator.middleware";
import { createReviewSchema } from "../../../dto/performanceReview.dto";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory as a Buffer

// Route for bulk uploading performance reviews
router.post(
  "/bulk-upload",
  upload.single("file"), // 'file' is the field name for the uploaded file
  performanceReviewController.bulkUploadReviews,
);

// Route for creating a single performance review
router.post(
  "/",
  zodValidator(createReviewSchema),
  performanceReviewController.createReview,
);

// Route for updating review status
router.patch("/:reviewId/status", performanceReviewController.updateReviewStatus);

// Other routes will go here

export default router;
