const mongoose = require("mongoose");

const organizationLeaveRequestSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

organizationLeaveRequestSchema.index(
    { organizationId: 1, userId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "pending" } }
);

module.exports = mongoose.model("OrganizationLeaveRequest", organizationLeaveRequestSchema);