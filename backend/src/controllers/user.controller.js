const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function handleUserRegistration(req, res) {
    try {
        const { name, email, password, role, organizationId} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        if (name.length < 3 || name.length > 30) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 3 and 30 characters",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,   
            organizationId: organizationId ? organizationId : null,
            role: role === "admin" ? "admin" : "member",
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                profilePicture: user.profilePicture
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration",
        });
    }
}

async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                profilePicture: user.profilePicture
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Error while logging in, please try again",
        });
    }
}

async function handleUserLogout(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error while logging out",
        });
    }
}

async function handleGetCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password").populate("organizationId", "orgName description orgLogo");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Current user fetched successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                organizationId: user.organizationId,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch user",
        });
    }
}

async function handleProfilePicture(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile picture file is required",
            });
        }

        const profilePicture = `/uploads/profilePictures/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                profilePicture: profilePicture,
            },
            {
                returnDocument: "after",
            },
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                organizationId: user.organizationId
            },
        });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating profile picture",
        });
    }
}

module.exports = {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
    handleGetCurrentUser,
    handleProfilePicture,
};
