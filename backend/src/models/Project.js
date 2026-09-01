const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        projectName: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 30
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
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
        },

        status: {
            type: String,
            enum: ["Active", "Completed"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

projectSchema.index({ organizationId: 1 });

const Project = mongoose.model(
    "Project",
    projectSchema
);

module.exports = Project;