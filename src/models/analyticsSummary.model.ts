import mongoose, { Schema, Document } from "mongoose";
import { IAnalyticsSummary } from "../dto/analyticsSummary.dto";

const AnalyticsSummarySchema = new Schema<IAnalyticsSummary>(
  {
    period: {
      type: {
        type: String,
        enum: ["quarterly", "annual"],
        required: true,
      },
      year: {
        type: Number,
        required: true,
        index: true,
      },
      quarter: {
        type: String,
        enum: ["Q1", "Q2", "Q3", "Q4"],
      },
    },
    department: {
      type: String,
      index: true,
    },
    employeeId: {
      type: String,
      ref: "Employee",
      index: true,
    },
    summary: {
      totalReviews: {
        type: Number,
        required: true,
      },
      averageRatings: {
        technical: Number,
        communication: Number,
        teamwork: Number,
        leadership: Number,
        problemSolving: Number,
        initiative: Number,
        overall: Number,
      },
      topStrengths: [
        {
          strength: String,
          frequency: Number,
        },
      ],
      commonWeaknesses: [
        {
          weakness: String,
          frequency: Number,
        },
      ],
      improvementAreas: [
        {
          area: String,
          frequency: Number,
        },
      ],
    },
    insights: {
      aiGeneratedSummary: {
        type: String,
        required: true,
      },
      keyFindings: [String],
      trends: [String],
      recommendations: [String],
    },
    actionItems: [
      {
        category: String,
        action: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        targetEmployees: [String],
      },
    ],
    learningPrograms: [
      {
        programName: String,
        description: String,
        targetSkill: String,
        recommendedFor: [String],
      },
    ],
    embedding: {
      type: [Number],
    },
    generatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
AnalyticsSummarySchema.index({
  "period.year": 1,
  "period.quarter": 1,
  department: 1,
});
AnalyticsSummarySchema.index({ "period.year": 1, "period.type": 1 });

export const AnalyticsSummary = mongoose.model<IAnalyticsSummary>(
  "AnalyticsSummary",
  AnalyticsSummarySchema,
);
