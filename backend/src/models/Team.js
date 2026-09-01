const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 30
        },

        description: {
            type: String,
            trim: true,
            maxlength: 200
        },

        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

teamSchema.index({ organizationId: 1 });

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;