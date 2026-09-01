const express = require("express");
const {
    createOrganization,
    getOrganization,
    updateOrganization,
    getOrganizationMembers
} = require("../controllers/organization.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);

router.post("/", authenticateUser,createOrganization);
router.get("/me", ensureOrganization, getOrganization);
router.patch("/me", ensureOrganization, authorizeAdmin, updateOrganization);
router.get("/members", ensureOrganization, getOrganizationMembers);

module.exports = router;
    