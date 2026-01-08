import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    team_lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const TeamMembers = mongoose.model("TeamMembers", teamMemberSchema);

export default TeamMembers;
