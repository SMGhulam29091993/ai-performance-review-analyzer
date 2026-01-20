import { PerformanceReview } from "../models/performanceReview.model";
import { Employee } from "../models/employee.model";
import { geminiService } from "./gemini.service";
import { IPerformanceReview, createReviewSchema } from "../dto/performanceReview.dto";

class PerformanceReviewService {
  /**
   * Create a new performance review with AI analysis
   */
  async createReview(reviewData: any): Promise<IPerformanceReview> {
    try {
      // Get employee details
      const employee = await Employee.findOne({
        employeeId: reviewData.employeeId,
      });
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Combine all feedback text for embedding
      const rawText = `
        Strengths: ${reviewData.feedback.strengths}
        Weaknesses: ${reviewData.feedback.weaknesses}
        Achievements: ${reviewData.feedback.achievements}
        Areas of Improvement: ${reviewData.feedback.areasOfImprovement}
        Manager Comments: ${reviewData.feedback.managerComments}
        ${reviewData.feedback.employeeSelfReview ? `Self Review: ${reviewData.feedback.employeeSelfReview}` : ""}
      `.trim();

      // Generate embedding for vector search
      const embedding = await geminiService.generateEmbedding(rawText);

      // Create review document
      const review = new PerformanceReview({
        ...reviewData,
        rawText,
        embedding,
      });

      await review.save();
      return review;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  /**
   * Bulk create performance reviews from parsed Excel data.
   */
  async bulkCreateReviews(
    reviewDataArray: any[],
  ): Promise<IPerformanceReview[]> {
    const createdReviews: IPerformanceReview[] = [];

    for (const rawReviewData of reviewDataArray) {
      try {
        // Transform flat Excel data to nested structure for validation
        const transformedReviewData = {
          employeeId: String(rawReviewData.employeeId),
          reviewerId: String(rawReviewData.reviewerId),
          reviewPeriod: {
            year: Number(rawReviewData.reviewPeriod_year),
            quarter: String(rawReviewData.reviewPeriod_quarter),
            startDate: new Date(rawReviewData.reviewPeriod_startDate),
            endDate: new Date(rawReviewData.reviewPeriod_endDate),
          },
          ratings: {
            technical: Number(rawReviewData.ratings_technical),
            communication: Number(rawReviewData.ratings_communication),
            teamwork: Number(rawReviewData.ratings_teamwork),
            leadership: Number(rawReviewData.ratings_leadership),
            problemSolving: Number(rawReviewData.ratings_problemSolving),
            initiative: Number(rawReviewData.ratings_initiative),
            overall: Number(rawReviewData.ratings_overall),
          },
          feedback: {
            strengths: String(rawReviewData.feedback_strengths),
            weaknesses: String(rawReviewData.feedback_weaknesses),
            achievements: String(rawReviewData.feedback_achievements),
            areasOfImprovement: String(
              rawReviewData.feedback_areasOfImprovement,
            ),
            managerComments: String(rawReviewData.feedback_managerComments),
            employeeSelfReview: rawReviewData.feedback_employeeSelfReview
              ? String(rawReviewData.feedback_employeeSelfReview)
              : undefined,
          },
          goals: rawReviewData.goals_previousGoalsStatus ||
            rawReviewData.goals_newGoals
            ? {
                previousGoalsStatus: rawReviewData.goals_previousGoalsStatus
                  ? String(rawReviewData.goals_previousGoalsStatus)
                  : undefined,
                newGoals: rawReviewData.goals_newGoals
                  ? String(rawReviewData.goals_newGoals)
                  : undefined,
              }
            : undefined,
          rawText: String(rawReviewData.rawText),
        };

        // Validate data using Zod schema
        const validatedData = createReviewSchema.parse(transformedReviewData);

        // Check if employee exists
        const employee = await Employee.findOne({
          employeeId: validatedData.employeeId,
        });
        if (!employee) {
          console.warn(
            `Skipping review for unknown employeeId: ${validatedData.employeeId}`,
          );
          continue; // Skip to the next review
        }

        // Generate embedding
        const rawTextForEmbedding = `
          Strengths: ${validatedData.feedback.strengths}
          Weaknesses: ${validatedData.feedback.weaknesses}
          Achievements: ${validatedData.feedback.achievements}
          Areas of Improvement: ${validatedData.feedback.areasOfImprovement}
          Manager Comments: ${validatedData.feedback.managerComments}
          ${validatedData.feedback.employeeSelfReview ? `Self Review: ${validatedData.feedback.employeeSelfReview}` : ""}
        `.trim();
        const embedding = await geminiService.generateEmbedding(
          rawTextForEmbedding,
        );

        // Create and save review
        const review = new PerformanceReview({
          ...validatedData,
          rawText: rawTextForEmbedding,
          embedding,
        });
        await review.save();
        createdReviews.push(review);
      } catch (error) {
        console.error(
          `Error processing review: ${JSON.stringify(rawReviewData)}`,
          error,
        );
        // Continue to process other reviews even if one fails
      }
    }

    return createdReviews;
  }

  /**
   * Get AI-generated summary for a specific review
   */
  async getReviewSummary(reviewId: string | string[]): Promise<any> {
    try {
      const review =
        await PerformanceReview.findById(reviewId).populate("employeeId");
      if (!review) {
        throw new Error("Review not found");
      }

      const employee = await Employee.findOne({
        employeeId: review.employeeId,
      });

      const reviewData = {
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : `${review.employeeId}`,
        department: employee?.department || "Unknown",
        period: `${review.reviewPeriod.quarter} ${review.reviewPeriod.year}`,
        ratings: review.ratings,
        feedback: review.feedback,
      };

      const aiSummary = await geminiService.summarizeReview(reviewData);

      return {
        review,
        aiAnalysis: aiSummary,
      };
    } catch (error) {
      console.error("Error getting review summary:", error);
      throw error;
    }
  }

  /**
   * Vector search for similar reviews using RAG
   */
  async searchSimilarReviews(
    query: string,
    filters?: any,
    limit: number = 5,
  ): Promise<any[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await geminiService.generateEmbedding(query);

      // MongoDB Atlas Vector Search
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $project: {
            _id: 1,
            employeeId: 1,
            reviewPeriod: 1,
            ratings: 1,
            feedback: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ];

      // Add filters if provided
      if (filters) {
        if (filters.department) {
          pipeline.push({
            $lookup: {
              from: "employees",
              localField: "employeeId",
              foreignField: "employeeId",
              as: "employee",
            },
          });
          pipeline.push({
            $match: { "employee.department": filters.department },
          });
        }

        if (filters.year) {
          pipeline.push({
            $match: { "reviewPeriod.year": filters.year },
          });
        }

        if (filters.quarter) {
          pipeline.push({
            $match: { "reviewPeriod.quarter": filters.quarter },
          });
        }
      }

      const results = await PerformanceReview.aggregate(pipeline);

      // Populate employee details
      for (let result of results) {
        result.employee = await Employee.findOne({
          employeeId: result.employeeId,
        });
      }

      return results;
    } catch (error) {
      console.error("Error in vector search:", error);
      throw error;
    }
  }

  /**
   * Get reviews by employee
   */
  async getEmployeeReviews(
    employeeId: string | string[],
    year?: number,
    quarter?: string,
  ): Promise<IPerformanceReview[]> {
    try {
      const query: any = { employeeId };

      if (year) {
        query["reviewPeriod.year"] = year;
      }

      if (quarter) {
        query["reviewPeriod.quarter"] = quarter;
      }

      const reviews = await PerformanceReview.find(query).sort({
        "reviewPeriod.year": -1,
        "reviewPeriod.quarter": -1,
      });
      return reviews;
    } catch (error) {
      console.error("Error getting employee reviews:", error);
      throw error;
    }
  }

  /**
   * Get reviews by period
   */
  async getReviewsByPeriod(
    year: number,
    quarter?: string,
    department?: string,
  ): Promise<IPerformanceReview[]> {
    try {
      const query: any = { "reviewPeriod.year": year };

      if (quarter) {
        query["reviewPeriod.quarter"] = quarter;
      }

      let reviews = await PerformanceReview.find(query);

      // Filter by department if specified
      if (department) {
        const employeeIds = await Employee.find({ department }).distinct(
          "employeeId",
        );
        reviews = reviews.filter((r) => employeeIds.includes(r.employeeId));
      }

      return reviews;
    } catch (error) {
      console.error("Error getting reviews by period:", error);
      throw error;
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(
    reviewId: string | string[],
    status: string,
  ): Promise<IPerformanceReview | null> {
    try {
      const review = await PerformanceReview.findByIdAndUpdate(
        reviewId,
        {
          status,
          ...(status === "submitted" && { "metadata.submittedAt": new Date() }),
          ...(status === "approved" && { "metadata.approvedAt": new Date() }),
        },
        { new: true },
      );

      return review;
    } catch (error) {
      console.error("Error updating review status:", error);
      throw error;
    }
  }
}

export const performanceReviewService = new PerformanceReviewService();
