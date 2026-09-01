const express = require("express");

const router = express.Router();

const { authenticateUser } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
    handleGetCurrentUser,
    handleProfilePicture,
} = require("../controllers/user.controller");

router.post("/register", handleUserRegistration);
router.post("/login", handleUserLogin);
router.post("/logout", handleUserLogout);
router.get("/me", authenticateUser, handleGetCurrentUser);
router.patch("/profile-picture", authenticateUser, upload.single("profilePicture"),handleProfilePicture);

module.exports = router;