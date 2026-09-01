const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const TeamProject = require("../models/TeamProject");
const TeamMember = require("../models/TeamMember");

async function validateTaskAssignment(projectId, assignedUserId, orgId) {
    if (!mongoose.Types.ObjectId.isValid(assignedUserId)) {
        return { 
            valid: false, 
            message: "Invalid assignedTo user ID" 
        };
    }
    const targetUser = await User.findById(assignedUserId);
    if (!targetUser) {
        return { 
            valid: false, 
            message: "Assigned user not found" 
        };
    }
    if (!targetUser.organizationId || targetUser.organizationId.toString() !== orgId.toString()) {
        return { 
            valid: false,
            message: "Assigned user does not belong to your organization" 
        };
    }

    const teamProjects = await TeamProject.find({ projectId });
    if (!teamProjects || teamProjects.length === 0) {
        return {
            valid: false,
            message: "Cannot assign task: No teams are attached to this project yet. Attach a team to the project first."
        };
    }

    const teamIds = teamProjects.map(tp => tp.teamId);
    const isMember = await TeamMember.exists({
        teamId: { $in: teamIds },
        userId: assignedUserId
    });
    if (!isMember) {
        return {
            valid: false,
            message: "Assigned user does not belong to any team working on this project"
        };
    }
    return { valid: true };
}

async function createTask(req, res) {
    try {
        const { projectId } = req.params;
        const { name, description, assignedTo, priority, dueDate } = req.body;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }
        if (!name || !description || !assignedTo || name.trim().length < 5 || name.trim().length > 30 || description.trim().length < 5 || description.trim().length > 200) {
            return res.status(400).json({
                success: false,
                message: "Task name, description, and assignedTo user ID are required or task name may exceeded the length or description may have exceeded the length"
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
        const assignmentCheck = await validateTaskAssignment(
            projectId,
            assignedTo,
            req.currentUser.organizationId
        );

        if (!assignmentCheck.valid) {
            return res.status(400).json({
                success: false,
                message: assignmentCheck.message
            });
        }

        const task = await Task.create({
            name: name,
            description: description,
            projectId,
            organizationId: req.currentUser.organizationId,
            createdBy: req.currentUser._id,
            assignedTo,
            status: "Todo",
            priority: priority && ["Low", "Medium", "High"].includes(priority) ? priority : "Medium",
            dueDate: dueDate ? new Date(dueDate) : undefined
        });

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email profilePicture")
            .populate("createdBy", "name email")
            .populate("projectId", "projectName");

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: populatedTask
        });
    } catch (error) {
        console.error("Create task error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating task"
        });
    }
}

async function getProjectTasks(req, res) {
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
        const tasks = await Task.find({
            projectId,
            organizationId: req.currentUser.organizationId
        })
            .populate("assignedTo", "name email profilePicture role")
            .populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Project tasks fetched successfully",
            data: tasks
        });
    } catch (error) {
        console.error("Get project tasks error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching project tasks"
        });
    }
}

async function getMyTasks(req, res) {
    try {
        const tasks = await Task.find({
            assignedTo: req.currentUser._id,
            organizationId: req.currentUser.organizationId
        })
            .populate("projectId", "projectName status")
            .populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "My tasks fetched successfully",
            data: tasks
        });
    } catch (error) {
        console.error("Get my tasks error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching assigned tasks"
        });
    }
}

async function getTaskById(req, res) {
    try {
        const { taskId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }
        const task = await Task.findOne({
            _id: taskId,
            organizationId: req.currentUser.organizationId
        })
            .populate("projectId", "projectName")
            .populate("assignedTo", "name email profilePicture")
            .populate("createdBy", "name email");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found in your organization"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            data: task
        });
    } catch (error) {
        console.error("Get task by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching task"
        });
    }
}

async function updateTask(req, res) {
    try {
        const { taskId } = req.params;
        const { name, description, priority, dueDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }
        const task = await Task.findOne({
            _id: taskId,
            organizationId: req.currentUser.organizationId
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found in your organization"
            });
        }
        if (name !== undefined) {
            if (name.trim().length < 5 || name.trim().length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Task name must be between 5 and 30 characters"
                });
            }
            task.name = name.trim();
        }
        if (description !== undefined) {
            if (description.trim().length < 5 || description.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be between 5 and 200 characters"
                });
            }
            task.description = description.trim();
        }
        if (priority !== undefined) {
            if (!["Low", "Medium", "High"].includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Priority must be 'Low', 'Medium', or 'High'"
                });
            }
            task.priority = priority;
        }
        if (dueDate !== undefined) {
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("projectId", "projectName")
            .populate("assignedTo", "name email profilePicture")
            .populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask
        });
    } catch (error) {
        console.error("Update task error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating task"
        });
    }
}

async function updateTaskStatus(req, res) {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }
        if (!status || !["Todo", "In-progress", "Completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'Todo', 'In-progress', or 'Completed'"
            });
        }
        const task = await Task.findOne({
            _id: taskId,
            organizationId: req.currentUser.organizationId
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found in your organization"
            });
        }
        task.status = status;
        await task.save();
        const updatedTask = await Task.findById(task._id)
            .populate("projectId", "projectName")
            .populate("assignedTo", "name email profilePicture")
            .populate("createdBy", "name email");
        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: updatedTask
        });
    } catch (error) {
        console.error("Update task status error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating task status"
        });
    }
}

async function assignTask(req, res) {
    try {
        const { taskId } = req.params;
        const { assignedTo } = req.body;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: "assignedTo user ID is required"
            });
        }
        const task = await Task.findOne({
            _id: taskId,
            organizationId: req.currentUser.organizationId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found in your organization"
            });
        }
        const assignmentCheck = await validateTaskAssignment(
            task.projectId,
            assignedTo,
            req.currentUser.organizationId
        );
        if (!assignmentCheck.valid) {
            return res.status(400).json({
                success: false,
                message: assignmentCheck.message
            });
        }
        task.assignedTo = assignedTo;
        await task.save();
        const updatedTask = await Task.findById(task._id)
            .populate("projectId", "projectName")
            .populate("assignedTo", "name email profilePicture")
            .populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            message: "Task assigned successfully",
            data: updatedTask
        });
    } catch (error) {
        console.error("Assign task error:", error);
        return res.status(500).json({
            success: false,
            message: "Error assigning task"
        });
    }
}

async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }
        const task = await Task.findOneAndDelete({
            _id: taskId,
            organizationId: req.currentUser.organizationId
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found in your organization"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Delete task error:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting task"
        });
    }
}

module.exports = {
    createTask,
    getProjectTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    assignTask,
    deleteTask
};
