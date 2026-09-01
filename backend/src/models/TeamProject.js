const mongoose = require("mongoose");

const teamProjectSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        }
    },
    {
        timestamps: true
    }
);

teamProjectSchema.index(
    { teamId: 1, projectId: 1 },
    { unique: true }
);

const TeamProject = mongoose.model(
    "TeamProject",
    teamProjectSchema
);

module.exports = TeamProject;