import mongoose from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  HR = "hr",
  PROJECT_MANAGER = "project_manager",
  DELIVERY_MANAGER = "delivery_manager",
  TEAM_LEAD = "team_lead",
  USER = "user",
}

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: UserRole, default: "User" },
    employee_id: { type: String, required: true, unique: true },
    department: { type: mongoose.Types.ObjectId, ref: "Department" },
    mobile_number: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
