import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    department: { type: mongoose.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
