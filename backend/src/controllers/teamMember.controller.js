const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");
const TeamMember = require("../models/TeamMember");

async function addTeamMember(req, res) {
    try {
        const { teamId, userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team ID or user ID"
            });
        }
        const team = await Team.findOne({
            _id: teamId,
            organizationId: req.currentUser.organizationId
        });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (!targetUser.organizationId || targetUser.organizationId.toString() !== req.currentUser.organizationId.toString()) {
            return res.status(400).json({
                success: false,
                message: "User does not belong to your organization"
            });
        }
        const existingMember = await TeamMember.findOne({
            teamId,
            userId
        });
        if (existingMember) {
            return res.status(409).json({
                success: false,
                message: "User is already a member of this team"
            });
        }
        const teamMember = await TeamMember.create({
            teamId,
            userId
        });
        const populatedMember = await TeamMember.findById(teamMember._id)
            .populate("userId", "name email profilePicture role")
            .populate("teamId", "teamName");

        return res.status(201).json({
            success: true,
            message: "Member added to team successfully",
            data: populatedMember
        });
    } catch (error) {
        console.error("Add team member error:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding member to team"
        });
    }
}

async function getTeamMembers(req, res) {
    try {
        const { teamId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team ID"
            });
        }
        const team = await Team.findOne({
            _id: teamId,
            organizationId: req.currentUser.organizationId
        });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }
        const members = await TeamMember.find({ teamId })
            .populate("userId", "name email profilePicture role")
            .populate("teamId", "teamName");

        return res.status(200).json({
            success: true,
            message: "Team members fetched successfully",
            data: members
        });
    } catch (error) {
        console.error("Get team members error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching team members"
        });
    }
}

async function removeTeamMember(req, res) {
    try {
        const { teamId, userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team ID or user ID"
            });
        }
        const team = await Team.findOne({
            _id: teamId,
            organizationId: req.currentUser.organizationId
        });
        if (!team) {    
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }
        const deletedRelationship = await TeamMember.findOneAndDelete({
            teamId,
            userId
        });

        if (!deletedRelationship) {
            return res.status(404).json({
                success: false,
                message: "User is not a member of this team"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Member removed from team successfully"
        });
    } catch (error) {
        console.error("Remove team member error:", error);
        return res.status(500).json({
            success: false,
            message: "Error removing member from team"
        });
    }
}

module.exports = {
    addTeamMember,
    getTeamMembers,
    removeTeamMember
};
