const mongoose = require("mongoose");
const Project = require("../models/Project");
const TeamProject = require("../models/TeamProject");
const Task = require("../models/Task");

async function createProject(req, res) {
    try {
        const { projectName, description } = req.body;
        if (!projectName || !description) {
            return res.status(400).json({
                success: false,
                message: "Project name and description are required"
            });
        }
        if (projectName.trim().length < 5 || projectName.trim().length > 30 || description.trim().length < 5 || description.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Project name and Description must be between 5 and 200 characters"
            });
        }

        const project = await Project.create({
            projectName: projectName,
            description: description,
            organizationId: req.currentUser.organizationId,
            createdBy: req.currentUser._id,
            status: "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        console.error("Create project error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating project"
        });
    }
}

async function getProjects(req, res) {
    try {
        const projects = await Project.find({
            organizationId: req.currentUser.organizationId
        }).populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: projects
        });
    } catch (error) {
        console.error("Get projects error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching projects"
        });
    }
}

async function getProjectById(req, res) {
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
        }).populate("createdBy", "name email");
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found in your organization"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project
        });
    } catch (error) {
        console.error("Get project by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching project"
        });
    }
}

async function updateProject(req, res) {
    try {
        const { projectId } = req.params;
        const { projectName, description, status } = req.body;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }
        const updates = {};
        if (projectName !== undefined) {
            if (projectName.trim().length < 5 || projectName.trim().length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Project name must be between 5 and 30 characters"
                });
            }
            updates.projectName = projectName.trim();
        }
        if (description !== undefined) {
            if (description.trim().length < 5 || description.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be between 5 and 200 characters"
                });
            }
            updates.description = description.trim();
        }
        if (status !== undefined) {
            if (!["Active", "Completed"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be either 'Active' or 'Completed'"
                });
            }
            updates.status = status;
        }
        const project = await Project.findOneAndUpdate(
            {
                _id: projectId,
                organizationId: req.currentUser.organizationId
            },
            updates,
            { 
                returnDocument: "after",
            }
        ).populate("createdBy", "name email");
        // if (!project) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "Project not found in your organization"
        //     });
        // }
        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (error) {
        console.error("Update project error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating project"
        });
    }
}

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
};
