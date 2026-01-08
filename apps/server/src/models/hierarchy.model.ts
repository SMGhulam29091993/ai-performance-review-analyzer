import mongoose from "mongoose";

const hierarchySchema = new mongoose.Schema(
  {
    delivery_manager: { type: mongoose.Types.ObjectId, ref: "User" },
    project_manager: { type: mongoose.Types.ObjectId, ref: "User" },
    team_lead: { type: mongoose.Types.ObjectId, ref: "User" },
    employees: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Hierarchy = mongoose.model("Hierarchy", hierarchySchema);

export default Hierarchy;
