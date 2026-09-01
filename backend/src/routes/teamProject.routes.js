const express = require("express");
const {
    attachTeamToProject,
    getProjectTeams,
    detachTeamFromProject
} = require("../controllers/teamProject.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);
router.use(ensureOrganization);

router.post("/:projectId/teams/:teamId", authorizeAdmin, attachTeamToProject);
router.get("/:projectId/teams", getProjectTeams);
router.delete("/:projectId/teams/:teamId", authorizeAdmin, detachTeamFromProject);

module.exports = router;
