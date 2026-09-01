const Organization = require("../models/Organization");
const User = require("../models/User");

async function createOrganization(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.organizationId) {
            return res.status(400).json({
                success: false,
                message: "User already belongs to an organization"
            });
        }
        const { orgName, description } = req.body;
        if (!orgName || !description || orgName.trim().length < 5 || orgName.trim().length > 30) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required"
            });
        }
        const organization = await Organization.create({
            orgName: orgName.trim(),
            description: description.trim(),
            createdBy: user._id
        });

        user.organizationId = organization._id;
        user.role = "admin";
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: organization
        });
    } catch (error) {
        console.error("Create organization error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating organization"
        });
    }
}

async function getOrganization(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.organizationId) {
            return res.status(404).json({
                success: false,
                message: "User does not belong to any organization"
            });
        }
        const organization = await Organization.findById(user.organizationId).populate("createdBy", "name email");
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Organization fetched successfully",
            data: organization
        });
    } catch (error) {
        console.error("Get organization error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching organization"
        });
    }
}

async function updateOrganization(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.organizationId) {
            return res.status(404).json({
                success: false,
                message: "User does not belong to any organization"
            });
        }
        const { orgName, description } = req.body;
        const updates = {};
        if (orgName !== undefined) {
            if (orgName.trim().length < 5 || orgName.trim().length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Organization name must be between 5 and 30 characters"
                });
            }
            updates.orgName = orgName.trim();
        }
        if (description !== undefined) {
            updates.description = description.trim();
        }
        const updatedOrganization = await Organization.findByIdAndUpdate(
            user.organizationId,
            updates,
            { 
                returnDocument: "after"
            }
        ).populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: updatedOrganization
        });
    } catch (error) {
        console.error("Update organization error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating organization"
        });
    }
}

async function getOrganizationMembers(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.organizationId) {
            return res.status(404).json({
                success: false,
                message: "User does not belong to any organization"
            });
        }
        const members = await User.find({ 
            organizationId: user.organizationId 
        }).select("-password");

        return res.status(200).json({
            success: true,
            message: "Organization members fetched successfully",
            data: members
        });
    } catch (error) {
        console.error("Get organization members error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching organization members"
        });
    }
}

module.exports = {
    createOrganization,
    getOrganization,
    updateOrganization,
    getOrganizationMembers
};
