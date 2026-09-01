const User = require("../models/User");

async function attachCurrentUser(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.currentUser = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
}

async function authorizeAdmin(req, res, next) {
    try {
        if (!req.currentUser) {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }
            req.currentUser = user;
        }
        if (req.currentUser.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access forbidden: Admins only"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization error"
        });
    }
}

async function ensureOrganization(req, res, next) {
    try {
        if (!req.currentUser) {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }
            req.currentUser = user;
        }
        if (!req.currentUser.organizationId) {
            return res.status(403).json({
                success: false,
                message: "You must belong to an organization to perform this action"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Organization authorization error"
        });
    }
}

module.exports = {
    attachCurrentUser,
    authorizeAdmin,
    ensureOrganization
};
