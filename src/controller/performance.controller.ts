import { Request, Response, NextFunction } from "express";
import { performanceReviewService } from "../services/performanceReview.service";
import { parseExcel } from "../utils/excel.parser";

class PerformanceReviewController {
  /**
   * Create a new performance review
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await performanceReviewService.createReview(req.body);

      res.status(201).json({
        success: true,
        message: "Performance review created successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review with AI-generated summary
   */
  async getReviewSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId || !Array.isArray(reviewId))
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });

      const result = await performanceReviewService.getReviewSummary(reviewId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search for similar reviews using RAG
   */
  async searchSimilarReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, department, year, quarter, limit } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const filters: any = {};
      if (department) filters.department = department;
      if (year) filters.year = parseInt(year as string);
      if (quarter) filters.quarter = quarter;

      const results = await performanceReviewService.searchSimilarReviews(
        query as string,
        filters,
        limit ? parseInt(limit as string) : 5,
      );

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get employee reviews
   */
  async getEmployeeReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      if (!employeeId || !Array.isArray(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        });
      }
      const { year, quarter } = req.query;

      const reviews = await performanceReviewService.getEmployeeReviews(
        employeeId,
        year ? parseInt(year as string) : undefined,
        quarter as string | undefined,
      );

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews by period
   */
  async getReviewsByPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, quarter, department } = req.query;

      if (!year) {
        return res.status(400).json({
          success: false,
          message: "Year is required",
        });
      }

      const reviews = await performanceReviewService.getReviewsByPeriod(
        parseInt(year as string),
        quarter as string | undefined,
        department as string | undefined,
      );

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId || !Array.isArray(reviewId)) {
        return res.status(400).json({
          success: false,
          message: "Review ID is required",
        });
      }
      const { status } = req.body;

      if (!["draft", "submitted", "approved", "published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const review = await performanceReviewService.updateReviewStatus(
        reviewId,
        status,
      );

      res.status(200).json({
        success: true,
        message: "Review status updated successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk upload reviews from Excel
   */
  async bulkUploadReviews(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Excel file is required",
        });
      }

      const reviewsData = parseExcel(req.file.buffer);

      const createdReviews = await performanceReviewService.bulkCreateReviews(
        reviewsData,
      );

      res.status(201).json({
        success: true,
        message: "Reviews uploaded successfully",
        data: createdReviews,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const performanceReviewController = new PerformanceReviewController();
