const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieparser = require("cookie-parser");

const userRoutes = require("./routes/user.route");
const organizationRoutes = require("./routes/organization.routes");
const teamRoutes = require("./routes/team.routes");
const teamMemberRoutes = require("./routes/teamMember.routes");
const projectRoutes = require("./routes/project.routes");
const teamProjectRoutes = require("./routes/teamProject.routes");
const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(
  cors({
    origin: "https://asset-sense-nine.vercel.app",
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/teammembers", teamMemberRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teamprojects", teamProjectRoutes);
app.use("/api", taskRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Project Management System API is running"
    });
});

app.use((err, req, res, next) => {
    console.error("API Error:", err);
    return res.status(err.status || 400).json({
        success: false,
        message: err.message || "An unexpected error occurred"
    });
});

module.exports = app;