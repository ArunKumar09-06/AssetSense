const express = require("express");
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
} = require("../controllers/project.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);
router.use(ensureOrganization);

router.post("/", authorizeAdmin, createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.patch("/:projectId", authorizeAdmin, updateProject);

module.exports = router;
