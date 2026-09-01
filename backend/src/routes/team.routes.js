const express = require("express");
const {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam
} = require("../controllers/team.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);
router.use(ensureOrganization);

router.post("/", authorizeAdmin, createTeam);
router.get("/", getTeams);
router.get("/:teamId", getTeamById);
router.patch("/:teamId", authorizeAdmin, updateTeam);
router.delete("/:teamId", authorizeAdmin, deleteTeam);

module.exports = router;
