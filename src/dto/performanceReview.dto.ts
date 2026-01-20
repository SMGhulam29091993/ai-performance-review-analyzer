import { z } from "zod";

/* ---------------------------------- */
/* Enums */
/* ---------------------------------- */

export const ReviewQuarterEnum = z.enum(["Q1", "Q2", "Q3", "Q4"]);

export const ReviewStatusEnum = z.enum([
  "draft",
  "submitted",
  "approved",
  "published",
]);

/* ---------------------------------- */
/* Reusable Validators */
/* ---------------------------------- */

const RatingSchema = z.number().min(1).max(5);

/* ---------------------------------- */
/* Performance Review Schema */
/* ---------------------------------- */

export const PerformanceReviewZodSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),

  reviewerId: z.string().min(1, "Reviewer ID is required"),

  reviewPeriod: z.object({
    year: z.number().int().min(2000),
    quarter: ReviewQuarterEnum,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }),

  ratings: z.object({
    technical: RatingSchema,
    communication: RatingSchema,
    teamwork: RatingSchema,
    leadership: RatingSchema,
    problemSolving: RatingSchema,
    initiative: RatingSchema,
    overall: RatingSchema,
  }),

  feedback: z.object({
    strengths: z.string().min(1),
    weaknesses: z.string().min(1),
    achievements: z.string().min(1),
    areasOfImprovement: z.string().min(1),
    managerComments: z.string().min(1),
    employeeSelfReview: z.string().optional(),
  }),

  goals: z
    .object({
      previousGoalsStatus: z.string().optional(),
      newGoals: z.string().optional(),
    })
    .optional(),

  rawText: z.string().min(1),

  embedding: z.array(z.number()).optional(),

  status: ReviewStatusEnum.default("draft"),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/* ---------------------------------- */
/* Inferred Types */
/* ---------------------------------- */

export type IPerformanceReview = z.infer<typeof PerformanceReviewZodSchema>;
export const createReviewSchema = PerformanceReviewZodSchema.omit({
  status: true,
  createdAt: true,
  updatedAt: true,
});
export const updateReviewSchema = PerformanceReviewZodSchema.pick({
  status: true,
  updatedAt: true,
});

export type ICreateReview = z.infer<typeof createReviewSchema>;
export type IUpdateReview = z.infer<typeof updateReviewSchema>;
