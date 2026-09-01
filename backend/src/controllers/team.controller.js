const mongoose = require("mongoose");
const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const TeamProject = require("../models/TeamProject");

async function createTeam(req, res) {
    try {
        const { teamName, description } = req.body;

        if (!teamName || teamName.trim().length < 3 || teamName.trim().length > 30) {
            return res.status(400).json({
                success: false,
                message: "Team name is required and team name must be between 3 and 30 characters"
            });
        }

        if (description && description.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Description must not exceed 200 characters"
            });
        }
        const team = await Team.create({
            teamName: teamName.trim(),
            description: description ? description.trim() : "",
            organizationId: req.currentUser.organizationId,
            createdBy: req.currentUser._id
        });
        await TeamMember.create({
            teamId: team._id,
            userId: req.currentUser._id
        });
        return res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: team
        });
    } catch (error) {
        console.error("Create team error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating team"
        });
    }
}

async function getTeams(req, res) {
    try {
        const teams = await Team.find({
            organizationId: req.currentUser.organizationId
        }).populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Teams fetched successfully",
            data: teams
        });
    } catch (error) {
        console.error("Get teams error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching teams"
        });
    }
}

async function getTeamById(req, res) {
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
        }).populate("createdBy", "name email");

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team fetched successfully",
            data: team
        });
    } catch (error) {
        console.error("Get team by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching team"
        });
    }
}

async function updateTeam(req, res) {
    try {
        const { teamId } = req.params;
        const { teamName, description } = req.body;
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team ID"
            });
        }
        const updates = {};
        if (teamName !== undefined) {
            if (teamName.trim().length < 3 || teamName.trim().length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Team name must be between 3 and 30 characters"
                });
            }
            updates.teamName = teamName.trim();
        }
        if (description !== undefined) {
            if (description.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Description must not exceed 200 characters"
                });
            }
            updates.description = description.trim();
        }
        const team = await Team.findOneAndUpdate(
            {
                _id: teamId,
                organizationId: req.currentUser.organizationId
            },
            updates,
            { 
                returnDocument: "after"
            }
        ).populate("createdBy", "name email");
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: team
        });
    } catch (error) {
        console.error("Update team error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating team"
        });
    }
}

async function deleteTeam(req, res) {
    try {
        const { teamId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid team ID"
            });
        }

        const team = await Team.findOneAndDelete({
            _id: teamId,
            organizationId: req.currentUser.organizationId
        });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found in your organization"
            });
        }
        await Promise.all([
            TeamMember.deleteMany({ teamId }),
            TeamProject.deleteMany({ teamId })
        ]);

        return res.status(200).json({
            success: true,
            message: "Team deleted successfully"
        });
    } catch (error) {
        console.error("Delete team error:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting team"
        });
    }
}

module.exports = {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam
};
