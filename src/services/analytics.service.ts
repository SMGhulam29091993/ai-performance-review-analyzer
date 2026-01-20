import { AnalyticsSummary } from "../models/analyticsSummary.model";
import { PerformanceReview } from "../models/performanceReview.model";
import { Employee } from "../models/employee.model";
import { geminiService } from "./gemini.service";
import { IAnalyticsSummary } from "../dto/analyticsSummary.dto";

type RatingKey =
  | "technical"
  | "communication"
  | "teamwork"
  | "leadership"
  | "problemSolving"
  | "initiative"
  | "overall";

class AnalyticsService {
  /**
   * Generate quarterly analytics summary
   */
  async generateQuarterlySummary(
    year: number,
    quarter: string,
    department?: string,
    employeeId?: string,
  ): Promise<IAnalyticsSummary> {
    try {
      // Check if summary already exists
      const existingQuery: any = {
        "period.type": "quarterly",
        "period.year": year,
        "period.quarter": quarter,
      };

      if (department) existingQuery.department = department;
      if (employeeId) existingQuery.employeeId = employeeId;

      let summary = await AnalyticsSummary.findOne(existingQuery);

      if (summary) {
        return summary;
      }

      // Get reviews for the period
      const reviewQuery: any = {
        "reviewPeriod.year": year,
        "reviewPeriod.quarter": quarter,
        status: "approved",
      };

      if (employeeId) {
        reviewQuery.employeeId = employeeId;
      }

      let reviews = await PerformanceReview.find(reviewQuery);

      // Filter by department if specified
      if (department) {
        const employeeIds = await Employee.find({ department }).distinct(
          "employeeId",
        );
        reviews = reviews.filter((r) => employeeIds.includes(r.employeeId));
      }

      if (reviews.length === 0) {
        throw new Error("No reviews found for the specified period");
      }

      // Calculate aggregate statistics
      const stats = this.calculateStatistics(reviews);

      // Generate AI insights
      const aiInsights = await geminiService.generateQuarterlySummary(
        reviews.map((r) => r.toObject()),
        quarter,
        year,
        department,
      );

      // Create summary document
      summary = new AnalyticsSummary({
        period: {
          type: "quarterly",
          year,
          quarter,
        },
        department,
        employeeId,
        summary: {
          totalReviews: reviews.length,
          averageRatings: stats.averageRatings,
          topStrengths: stats.topStrengths,
          commonWeaknesses: stats.commonWeaknesses,
          improvementAreas: stats.improvementAreas,
        },
        insights: {
          aiGeneratedSummary: aiInsights?.executiveSummary || "",
          keyFindings: aiInsights?.keyFindings || [],
          trends: aiInsights?.trends || [],
          recommendations: aiInsights?.recommendations || [],
        },
        actionItems:
          aiInsights.actionItems?.map((item: any) => ({
            category: item.category || "General",
            action: item.action,
            priority: item.priority || "medium",
            targetEmployees: item.targetEmployees || [],
          })) || [],
        learningPrograms:
          aiInsights.learningPrograms?.map((program: any) => ({
            programName: program.programName,
            description: program.description,
            targetSkill: program.targetSkill,
            recommendedFor: program.recommendedFor || [],
          })) || [],
        generatedBy: "system",
      });

      // Generate embedding for the summary
      const summaryText = `${summary.insights.aiGeneratedSummary} ${
        Array.isArray(summary.insights.keyFindings) &&
        summary.insights.keyFindings.length > 0
          ? summary.insights.keyFindings.join(" ")
          : ""
      }`;
      summary.embedding = await geminiService.generateEmbedding(summaryText);

      await summary.save();
      return summary;
    } catch (error) {
      console.error("Error generating quarterly summary:", error);
      throw error;
    }
  }

  /**
   * Generate annual analytics summary
   */
  async generateAnnualSummary(
    year: number,
    department?: string,
    employeeId?: string,
  ): Promise<IAnalyticsSummary> {
    try {
      // Check if summary already exists
      const existingQuery: any = {
        "period.type": "annual",
        "period.year": year,
      };

      if (department) existingQuery.department = department;
      if (employeeId) existingQuery.employeeId = employeeId;

      let summary = await AnalyticsSummary.findOne(existingQuery);

      if (summary) {
        return summary;
      }

      // Get all quarterly summaries for the year
      const quarterlyQuery: any = {
        "period.type": "quarterly",
        "period.year": year,
      };

      if (department) quarterlyQuery.department = department;
      if (employeeId) quarterlyQuery.employeeId = employeeId;

      const quarterlySummaries = await AnalyticsSummary.find(
        quarterlyQuery,
      ).sort({ "period.quarter": 1 });

      if (quarterlySummaries.length === 0) {
        throw new Error(
          "No quarterly summaries found. Generate quarterly summaries first.",
        );
      }

      // Get all reviews for the year for detailed stats
      const reviewQuery: any = {
        "reviewPeriod.year": year,
        status: "approved",
      };

      if (employeeId) {
        reviewQuery.employeeId = employeeId;
      }

      let reviews = await PerformanceReview.find(reviewQuery);

      if (department) {
        const employeeIds = await Employee.find({ department }).distinct(
          "employeeId",
        );
        reviews = reviews.filter((r) => employeeIds.includes(r.employeeId));
      }

      // Calculate annual statistics
      const stats = this.calculateStatistics(reviews);

      // Generate AI insights for the year
      const aiInsights = await geminiService.generateAnnualSummary(
        quarterlySummaries.map((q) => q.toObject()),
        year,
        department,
      );

      // Create annual summary
      summary = new AnalyticsSummary({
        period: {
          type: "annual",
          year,
        },
        department,
        employeeId,
        summary: {
          totalReviews: reviews.length,
          averageRatings: stats.averageRatings,
          topStrengths: stats.topStrengths,
          commonWeaknesses: stats.commonWeaknesses,
          improvementAreas: stats.improvementAreas,
        },
        insights: {
          aiGeneratedSummary: aiInsights.executiveSummary,
          keyFindings: [
            ...(aiInsights.keyAchievements || []),
            ...(aiInsights.persistentChallenges || []),
          ],
          trends: aiInsights.yearOverYearTrends || [],
          recommendations: aiInsights.strategicRecommendations || [],
        },
        actionItems:
          aiInsights.actionItems?.map((item: any) => ({
            category: item.category || "Strategic",
            action: item.action,
            priority: item.priority || "medium",
            targetEmployees: item.targetEmployees || [],
          })) || [],
        learningPrograms:
          aiInsights.learningRoadmap?.map((program: any) => ({
            programName: program.programName,
            description: program.description,
            targetSkill: program.targetSkill,
            recommendedFor: program.recommendedFor || [],
          })) || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          generatedBy: "system",
        },
      });

      // Generate embedding
      const summaryText = `${summary.insights.aiGeneratedSummary} ${
        Array.isArray(summary.insights.keyFindings) &&
        summary.insights.keyFindings.length > 0
          ? summary.insights.keyFindings.join(" ")
          : ""
      }`;
      summary.embedding = await geminiService.generateEmbedding(summaryText);

      await summary.save();
      return summary;
    } catch (error) {
      console.error("Error generating annual summary:", error);
      throw error;
    }
  }

  /**
   * Calculate statistical aggregates from reviews
   */
  private calculateStatistics(reviews: any[]): any {
    const totalReviews = reviews.length;

    // Calculate average ratings
    const ratingKeys: RatingKey[] = [
      "technical",
      "communication",
      "teamwork",
      "leadership",
      "problemSolving",
      "initiative",
      "overall",
    ];
    const averageRatings: any = {};

    ratingKeys.forEach((key) => {
      const sum = reviews.reduce(
        (acc, review) => acc + (review.ratings[key] || 0),
        0,
      );
      averageRatings[key] =
        totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(2)) : 0;
    });

    // Extract and count strengths, weaknesses, and improvement areas
    const strengthsMap = new Map<string, number>();
    const weaknessesMap = new Map<string, number>();
    const improvementsMap = new Map<string, number>();

    reviews.forEach((review) => {
      this.extractKeywords(review.feedback.strengths).forEach((strength) => {
        strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
      });

      this.extractKeywords(review.feedback.weaknesses).forEach((weakness) => {
        weaknessesMap.set(weakness, (weaknessesMap.get(weakness) || 0) + 1);
      });

      this.extractKeywords(review.feedback.areasOfImprovement).forEach(
        (area) => {
          improvementsMap.set(area, (improvementsMap.get(area) || 0) + 1);
        },
      );
    });

    return {
      averageRatings,
      topStrengths: this.getTopItems(strengthsMap, 10),
      commonWeaknesses: this.getTopItems(weaknessesMap, 10),
      improvementAreas: this.getTopItems(improvementsMap, 10),
    };
  }

  /**
   * Extract keywords from text (simple implementation)
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "was",
      "are",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "may",
      "might",
      "can",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    // Create n-grams (up to 3 words)
    const ngrams: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const w1 = words[i];

      if (!w1) continue; // safety guard

      ngrams.push(w1);

      if (i + 1 < words.length) {
        const w2 = words[i + 1];
        if (w2) {
          ngrams.push(`${w1} ${w2}`);
        }
      }

      if (i + 2 < words.length) {
        const w2 = words[i + 1];
        const w3 = words[i + 2];
        if (w2 && w3) {
          ngrams.push(`${w1} ${w2} ${w3}`);
        }
      }
    }

    return ngrams;
  }

  /**
   * Get top N items from a frequency map
   */
  private getTopItems(
    map: Map<string, number>,
    n: number,
  ): Array<{
    strength?: string;
    weakness?: string;
    area?: string;
    frequency: number;
  }> {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([text, frequency]) => {
        const key =
          map === arguments[0]
            ? "strength"
            : map === arguments[1]
              ? "weakness"
              : "area";
        return { [key]: text, frequency };
      });
  }

  /**
   * Get analytics summary by period
   */
  async getSummary(
    year: number,
    quarter?: string,
    department?: string,
    employeeId?: string,
  ): Promise<IAnalyticsSummary | null> {
    try {
      const query: any = {
        "period.year": year,
      };

      if (quarter) {
        query["period.type"] = "quarterly";
        query["period.quarter"] = quarter;
      } else {
        query["period.type"] = "annual";
      }

      if (department) query.department = department;
      if (employeeId) query.employeeId = employeeId;

      return await AnalyticsSummary.findOne(query);
    } catch (error) {
      console.error("Error getting summary:", error);
      throw error;
    }
  }

  /**
   * Compare multiple periods
   */
  async comparePeriods(
    periods: Array<{ year: number; quarter?: string }>,
    department?: string,
  ): Promise<any> {
    try {
      const summaries = await Promise.all(
        periods.map((period) =>
          this.getSummary(period.year, period.quarter, department),
        ),
      );

      return {
        periods: periods.map((period, index) => ({
          period,
          summary: summaries[index],
        })),
        comparison: this.generateComparison(
          summaries.filter((s) => s !== null),
        ),
      };
    } catch (error) {
      console.error("Error comparing periods:", error);
      throw error;
    }
  }

  /**
   * Generate comparison metrics between summaries
   */
  private generateComparison(summaries: IAnalyticsSummary[]): any {
    if (summaries.length === 0) return null;

    const ratingTrends: any = {};
    const ratingKeys: RatingKey[] = [
      "technical",
      "communication",
      "teamwork",
      "leadership",
      "problemSolving",
      "initiative",
      "overall",
    ];

    ratingKeys.forEach((key) => {
      ratingTrends[key] = summaries.map((s) => s.summary.averageRatings[key]);
    });

    return {
      ratingTrends,
      reviewCountTrend: summaries.map((s) => s.summary.totalReviews),
      overallTrend: summaries.map((s) => s.summary.averageRatings.overall),
    };
  }
}

export const analyticsService = new AnalyticsService();
