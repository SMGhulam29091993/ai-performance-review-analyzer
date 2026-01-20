import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private embeddingModel: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiAPI as string);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "embedding-001",
    });
  }

  /**
   * Generate text embedding for vector search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Summarize individual performance review
   */
  async summarizeReview(reviewData: any): Promise<any> {
    const prompt = `
Analyze this performance review and provide a structured summary:

Employee: ${reviewData.employeeName}
Department: ${reviewData.department}
Review Period: ${reviewData.period}

Ratings:
- Technical: ${reviewData.ratings.technical}/5
- Communication: ${reviewData.ratings.communication}/5
- Teamwork: ${reviewData.ratings.teamwork}/5
- Leadership: ${reviewData.ratings.leadership}/5
- Problem Solving: ${reviewData.ratings.problemSolving}/5
- Initiative: ${reviewData.ratings.initiative}/5
- Overall: ${reviewData.ratings.overall}/5

Feedback:
Strengths: ${reviewData.feedback.strengths}
Weaknesses: ${reviewData.feedback.weaknesses}
Achievements: ${reviewData.feedback.achievements}
Areas of Improvement: ${reviewData.feedback.areasOfImprovement}
Manager Comments: ${reviewData.feedback.managerComments}

Provide a JSON response with:
1. summary: A concise 2-3 sentence overall summary
2. keyStrengths: Array of 3-5 key strengths identified
3. keyWeaknesses: Array of 3-5 key weaknesses identified
4. improvementAreas: Array of 3-5 specific areas needing improvement
5. actionItems: Array of 3-5 specific, actionable recommendations
6. recommendedPrograms: Array of 2-3 learning programs/courses that would benefit this employee

Format as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Invalid response format from AI");
    } catch (error) {
      console.error("Error in summarizeReview:", error);
      throw new Error("Failed to generate review summary");
    }
  }

  /**
   * Generate quarterly analytics summary
   */
  async generateQuarterlySummary(
    reviews: any[],
    quarter: string,
    year: number,
    department?: string,
  ): Promise<any> {
    const prompt = `
Analyze these ${reviews.length} performance reviews for ${department || "all departments"} in ${quarter} ${year}:

${reviews
  .map(
    (r, i) => `
Review ${i + 1}:
- Overall Rating: ${r.ratings.overall}/5
- Strengths: ${r.feedback.strengths}
- Weaknesses: ${r.feedback.weaknesses}
- Improvements Needed: ${r.feedback.areasOfImprovement}
`,
  )
  .join("\n")}

Provide a comprehensive JSON analysis with:
1. executiveSummary: 3-4 sentence overview of the quarter's performance
2. keyFindings: Array of 5-7 major findings or patterns observed
3. trends: Array of 3-5 trends noticed across reviews
4. topStrengths: Array of 5 most common strengths with frequency estimates
5. commonWeaknesses: Array of 5 most common weaknesses with frequency estimates
6. departmentalInsights: Specific insights about ${department || "each department"}
7. recommendations: Array of 5-7 strategic recommendations for HR/management
8. actionItems: Array of 5-7 specific action items with priority (high/medium/low)
9. learningPrograms: Array of 3-5 recommended training programs with target skills and descriptions

Format as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Invalid response format from AI");
    } catch (error) {
      console.error("Error in generateQuarterlySummary:", error);
      throw new Error("Failed to generate quarterly summary");
    }
  }

  /**
   * Generate annual analytics summary
   */
  async generateAnnualSummary(
    quarterlySummaries: any[],
    year: number,
    department?: string,
  ): Promise<any> {
    const prompt = `
Analyze these quarterly summaries for ${department || "all departments"} in ${year}:

${quarterlySummaries
  .map(
    (q, i) => `
${q.period.quarter} Summary:
- Total Reviews: ${q.summary.totalReviews}
- Average Overall Rating: ${q.summary.averageRatings.overall}/5
- Key Findings: ${q.insights.keyFindings.join(", ")}
- Top Recommendations: ${q.insights.recommendations.slice(0, 3).join(", ")}
`,
  )
  .join("\n")}

Provide a comprehensive annual analysis as JSON with:
1. executiveSummary: 4-5 sentence overview of the year's performance
2. yearOverYearTrends: Array of 5-7 trends observed throughout the year
3. quarterlyComparison: Object comparing Q1, Q2, Q3, Q4 performance
4. keyAchievements: Array of 5-7 major achievements across the year
5. persistentChallenges: Array of 3-5 challenges that appeared in multiple quarters
6. growthAreas: Array of 5 areas showing improvement over the year
7. concernAreas: Array of 3-5 areas showing decline or persistent issues
8. strategicRecommendations: Array of 7-10 high-level strategic recommendations
9. actionItems: Array of 7-10 prioritized action items for the next year
10. learningRoadmap: Array of 5-7 learning programs organized by priority

Format as valid JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Invalid response format from AI");
    } catch (error) {
      console.error("Error in generateAnnualSummary:", error);
      throw new Error("Failed to generate annual summary");
    }
  }

  /**
   * RAG-based search for similar reviews
   */
  async searchSimilarReviews(query: string, limit: number = 5): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      // This will be used with MongoDB vector search
      return queryEmbedding as any;
    } catch (error) {
      console.error("Error in searchSimilarReviews:", error);
      throw new Error("Failed to search similar reviews");
    }
  }
}

export const geminiService = new GeminiService();
