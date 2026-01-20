import mongoose, { Schema } from "mongoose";
import { IEmployee } from "../dto/employee.dto";

export enum DepartmentEnum {
  Engineering = "Engineering",
  Sales = "Sales",
  Marketing = "Marketing",
  HR = "HR",
  Finance = "Finance",
  Operations = "Operations",
  Product = "Product",
  CustomerSupport = "Customer Support",
  Other = "Other",
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: DepartmentEnum,
    },
    position: {
      type: String,
      required: true,
    },
    managerId: {
      type: String,
      ref: "Employee",
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
