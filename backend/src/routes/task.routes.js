const express = require("express");
const {
    createTask,
    getProjectTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    assignTask,
    deleteTask
} = require("../controllers/task.controller");
const { authenticateUser } = require("../middlewares/auth");
const { ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);
router.use(ensureOrganization);

router.post("/projects/:projectId/tasks", createTask);
router.get("/projects/:projectId/tasks", getProjectTasks);

router.get("/tasks/my", getMyTasks);
router.get("/tasks/:taskId", getTaskById);
router.patch("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);
router.patch("/tasks/:taskId/status", updateTaskStatus);
router.patch("/tasks/:taskId/assign", assignTask);

module.exports = router;
