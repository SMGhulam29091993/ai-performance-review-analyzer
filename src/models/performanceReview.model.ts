import mongoose, { Schema, Document } from "mongoose";
import { IPerformanceReview } from "../dto/performanceReview.dto";

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    employeeId: {
      type: String,
      required: true,
      ref: "Employee",
      index: true,
    },
    reviewerId: {
      type: String,
      required: true,
      ref: "Employee",
    },
    reviewPeriod: {
      year: {
        type: Number,
        required: true,
        index: true,
      },
      quarter: {
        type: String,
        required: true,
        enum: ["Q1", "Q2", "Q3", "Q4"],
        index: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    ratings: {
      technical: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      teamwork: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      leadership: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      problemSolving: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      initiative: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
    feedback: {
      strengths: {
        type: String,
        required: true,
      },
      weaknesses: {
        type: String,
        required: true,
      },
      achievements: {
        type: String,
        required: true,
      },
      areasOfImprovement: {
        type: String,
        required: true,
      },
      managerComments: {
        type: String,
        required: true,
      },
      employeeSelfReview: {
        type: String,
      },
    },
    goals: {
      previousGoalsStatus: String,
      newGoals: String,
    },
    rawText: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient quarterly/annual queries
PerformanceReviewSchema.index({
  employeeId: 1,
  "reviewPeriod.year": 1,
  "reviewPeriod.quarter": 1,
});
PerformanceReviewSchema.index({
  "reviewPeriod.year": 1,
  "reviewPeriod.quarter": 1,
});

// Vector search index (create this in MongoDB Atlas)
// db.performancereviews.createSearchIndex({
//   name: "vector_index",
//   type: "vectorSearch",
//   definition: {
//     fields: [{
//       type: "vector",
//       path: "embedding",
//       numDimensions: 768,
//       similarity: "cosine"
//     }]
//   }
// });

export const PerformanceReview = mongoose.model<IPerformanceReview>(
  "PerformanceReview",
  PerformanceReviewSchema,
);
