const Organization = require("../models/Organization");
const OrganizationLeaveRequest = require("../models/OrganizationLeaveRequest");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const TeamMember = require("../models/TeamMember");
const TeamProject = require("../models/TeamProject");
const crypto = require("crypto");

function createInviteCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

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
            createdBy: user._id,
            inviteCode: createInviteCode()
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
        if (!organization.inviteCode) {
            organization.inviteCode = createInviteCode();
            await organization.save();
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

async function joinOrganization(req, res) {
    try {
        const inviteCode = req.body.inviteCode?.trim().toUpperCase();
        if (!inviteCode) {
            return res.status(400).json({ success: false, message: "Organization code is required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.organizationId) {
            return res.status(400).json({ success: false, message: "You already belong to an organization" });
        }

        const organization = await Organization.findOne({ inviteCode });
        if (!organization) {
            return res.status(404).json({ success: false, message: "Invalid organization code" });
        }

        user.organizationId = organization._id;
        user.role = "member";
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Joined ${organization.orgName} successfully`,
            data: organization
        });
    } catch (error) {
        console.error("Join organization error:", error);
        return res.status(500).json({ success: false, message: "Error joining organization" });
    }
}

async function requestOrganizationLeave(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.organizationId) {
            return res.status(400).json({ success: false, message: "You do not belong to an organization" });
        }
        if (user.role === "admin") {
            return res.status(400).json({ success: false, message: "Admins cannot leave until another admin is assigned" });
        }

        const request = await OrganizationLeaveRequest.findOneAndUpdate(
            { organizationId: user.organizationId, userId: user._id, status: "pending" },
            { $setOnInsert: { organizationId: user.organizationId, userId: user._id } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(201).json({
            success: true,
            message: "Leave request sent to the organization admin",
            data: request
        });
    } catch (error) {
        console.error("Request organization leave error:", error);
        return res.status(500).json({ success: false, message: "Error creating leave request" });
    }
}

async function getMyLeaveRequest(req, res) {
    try {
        const request = await OrganizationLeaveRequest.findOne({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate("organizationId", "orgName");
        return res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error("Get leave request error:", error);
        return res.status(500).json({ success: false, message: "Error fetching leave request status" });
    }
}

async function getOrganizationLeaveRequests(req, res) {
    try {
        const requests = await OrganizationLeaveRequest.find({
            organizationId: req.currentUser.organizationId,
            status: "pending"
        }).populate("userId", "name email profilePicture role").sort({ createdAt: 1 });
        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error("Get organization leave requests error:", error);
        return res.status(500).json({ success: false, message: "Error fetching leave requests" });
    }
}

async function reviewOrganizationLeaveRequest(req, res) {
    try {
        const { requestId } = req.params;
        const { decision } = req.body;
        if (!["approve", "reject"].includes(decision)) {
            return res.status(400).json({ success: false, message: "Decision must be approve or reject" });
        }

        const request = await OrganizationLeaveRequest.findOne({
            _id: requestId,
            organizationId: req.currentUser.organizationId,
            status: "pending"
        });
        if (!request) {
            return res.status(404).json({ success: false, message: "Pending leave request not found" });
        }

        if (decision === "approve") {
            const user = await User.findOne({ _id: request.userId, organizationId: request.organizationId });
            if (user) {
                const projects = await Project.find({
                    organizationId: request.organizationId,
                    createdBy: user._id
                }).select("_id");
                const projectIds = projects.map((project) => project._id);

                await Promise.all([
                    TeamMember.deleteMany({ userId: user._id }),
                    Task.deleteMany({
                        organizationId: request.organizationId,
                        $or: [
                            { assignedTo: user._id },
                            { createdBy: user._id },
                            { projectId: { $in: projectIds } }
                        ]
                    }),
                    TeamProject.deleteMany({ projectId: { $in: projectIds } }),
                    Project.deleteMany({ _id: { $in: projectIds } })
                ]);

                user.organizationId = null;
                user.role = "member";
                await user.save();
            }
        }

        request.status = decision === "approve" ? "approved" : "rejected";
        request.reviewedAt = new Date();
        await request.save();

        return res.status(200).json({
            success: true,
            message: decision === "approve" ? "Leave approved and member released" : "Leave request rejected",
            data: { status: request.status }
        });
    } catch (error) {
        console.error("Review organization leave request error:", error);
        return res.status(500).json({ success: false, message: "Error reviewing leave request" });
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
    joinOrganization,
    requestOrganizationLeave,
    getMyLeaveRequest,
    getOrganizationLeaveRequests,
    reviewOrganizationLeaveRequest,
    getOrganization,
    updateOrganization,
    getOrganizationMembers
};
