const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        orgName: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 30
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        orgLogo: {
            type: String,
            default: "/default/default-company-logo.png"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Organization = mongoose.model(
    "Organization",
    organizationSchema
);

module.exports = Organization;