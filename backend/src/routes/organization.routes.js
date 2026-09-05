const express = require("express");
const {
    createOrganization,
    joinOrganization,
    requestOrganizationLeave,
    getMyLeaveRequest,
    getOrganizationLeaveRequests,
    reviewOrganizationLeaveRequest,
    getOrganization,
    updateOrganization,
    getOrganizationMembers
} = require("../controllers/organization.controller");
const { authenticateUser } = require("../middlewares/auth");
const { authorizeAdmin, ensureOrganization } = require("../middlewares/authorize");

const router = express.Router();

router.use(authenticateUser);

router.post("/", authenticateUser,createOrganization);
router.post("/join", joinOrganization);
router.post("/leave-requests", requestOrganizationLeave);
router.get("/leave-requests/me", getMyLeaveRequest);
router.get("/leave-requests", ensureOrganization, authorizeAdmin, getOrganizationLeaveRequests);
router.patch("/leave-requests/:requestId", ensureOrganization, authorizeAdmin, reviewOrganizationLeaveRequest);
router.get("/me", ensureOrganization, getOrganization);
router.patch("/me", ensureOrganization, authorizeAdmin, updateOrganization);
router.get("/members", ensureOrganization, getOrganizationMembers);

module.exports = router;
    