const mongoose = require("mongoose");
const Project = require("../models/Project");
const Team = require("../models/Team");
const TeamProject = require("../models/TeamProject");

async function attachTeamToProject(req, res) {
    try {
        const { projectId, teamId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID or team ID"
            });
        }
        const project = await Project.findOne({
            _id: projectId,
            organizationId: req.currentUser.organizationId
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found in your organization"
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
        const existingAttachment = await TeamProject.findOne({
            teamId,
            projectId
        });
        if (existingAttachment) {
            return res.status(409).json({
                success: false,
                message: "Team is already attached to this project"
            });
        }
        const teamProject = await TeamProject.create({
            teamId,
            projectId
        });

        const populatedTeamProject = await TeamProject.findById(teamProject._id)
            .populate("teamId", "teamName description")
            .populate("projectId", "projectName description");

        return res.status(201).json({
            success: true,
            message: "Team attached to project successfully",
            data: populatedTeamProject
        });
    } catch (error) {
        console.error("Attach team to project error:", error);
        return res.status(500).json({
            success: false,
            message: "Error attaching team to project"
        });
    }
}

async function getProjectTeams(req, res) {
    try {
        const { projectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }
        const project = await Project.findOne({
            _id: projectId,
            organizationId: req.currentUser.organizationId
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found in your organization"
            });
        }
        const projectTeams = await TeamProject.find({ projectId })
            .populate("teamId", "teamName description")
            .populate("projectId", "projectName description");
        return res.status(200).json({
            success: true,
            message: "Project teams fetched successfully",
            data: projectTeams
        });
    } catch (error) {
        console.error("Get project teams error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching project teams"
        });
    }
}

async function detachTeamFromProject(req, res) {
    try {
        const { projectId, teamId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID or team ID"
            });
        }
        const project = await Project.findOne({
            _id: projectId,
            organizationId: req.currentUser.organizationId
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found in your organization"
            });
        }
        const deletedAttachment = await TeamProject.findOneAndDelete({
            teamId,
            projectId
        });
        if (!deletedAttachment) {
            return res.status(404).json({
                success: false,
                message: "Team is not attached to this project"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Team detached from project successfully"
        });
    } catch (error) {
        console.error("Detach team from project error:", error);
        return res.status(500).json({
            success: false,
            message: "Error detaching team from project"
        });
    }
}

module.exports = {
    attachTeamToProject,
    getProjectTeams,
    detachTeamFromProject
};
