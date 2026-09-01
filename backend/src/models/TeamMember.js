const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

teamMemberSchema.index(
    { teamId: 1, userId: 1 },
    { unique: true }
);

const TeamMember = mongoose.model(
    "TeamMember",
    teamMemberSchema
);

module.exports = TeamMember;
