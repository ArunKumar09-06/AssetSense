const express = require("express");
const {
    addTeamMember,
    getTeamMembers,
    removeTeamMember
} = require("../controllers/teamMember.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);
router.use(ensureOrganization);

router.post("/:teamId/members/:userId", authorizeAdmin, addTeamMember);
router.get("/:teamId/members", getTeamMembers);
router.delete("/:teamId/members/:userId", authorizeAdmin, removeTeamMember);

module.exports = router;
