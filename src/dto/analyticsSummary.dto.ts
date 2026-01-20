import { z } from "zod";

/* ---------------------------------- */
/* Enums */
/* ---------------------------------- */

export const AnalyticsPeriodTypeEnum = z.enum(["quarterly", "annual"]);

export const ReviewQuarterEnum = z.enum(["Q1", "Q2", "Q3", "Q4"]);

export const ActionPriorityEnum = z.enum(["low", "medium", "high"]);

/* ---------------------------------- */
/* Reusable Schemas */
/* ---------------------------------- */

const FrequencyItemSchema = z.object({
  frequency: z.number().int().min(0),
});

const RatingAveragesSchema = z.object({
  technical: z.number().optional(),
  communication: z.number().optional(),
  teamwork: z.number().optional(),
  leadership: z.number().optional(),
  problemSolving: z.number().optional(),
  initiative: z.number().optional(),
  overall: z.number().optional(),
});

/* ---------------------------------- */
/* Analytics Summary Schema */
/* ---------------------------------- */

export const AnalyticsSummaryZodSchema = z.object({
  period: z.object({
    type: AnalyticsPeriodTypeEnum,
    year: z.number().int().min(2000),
    quarter: ReviewQuarterEnum.optional(),
  }),

  department: z.string().optional(),

  employeeId: z.string().optional(),

  summary: z.object({
    totalReviews: z.number().int().min(0),

    averageRatings: RatingAveragesSchema,

    topStrengths: z.array(
      FrequencyItemSchema.extend({
        strength: z.string().min(1),
      }),
    ),

    commonWeaknesses: z.array(
      FrequencyItemSchema.extend({
        weakness: z.string().min(1),
      }),
    ),

    improvementAreas: z.array(
      FrequencyItemSchema.extend({
        area: z.string().min(1),
      }),
    ),
  }),

  insights: z.object({
    aiGeneratedSummary: z.string().min(1),
    keyFindings: z.array(z.string()).optional(),
    trends: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }),

  actionItems: z
    .array(
      z.object({
        category: z.string().optional(),
        action: z.string().optional(),
        priority: ActionPriorityEnum.optional(),
        targetEmployees: z.array(z.string()).optional(),
      }),
    )
    .optional(),

  learningPrograms: z
    .array(
      z.object({
        programName: z.string().optional(),
        description: z.string().optional(),
        targetSkill: z.string().optional(),
        recommendedFor: z.array(z.string()).optional(),
      }),
    )
    .optional(),

  embedding: z.array(z.number()).optional(),

  generatedBy: z.string().min(1),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/* ---------------------------------- */
/* Inferred Types */
/* ---------------------------------- */

export type IAnalyticsSummary = z.infer<typeof AnalyticsSummaryZodSchema>;
