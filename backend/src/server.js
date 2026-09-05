require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db.js");

const port = process.env.PORT || 5000;

const StartServer = async () => {
  try {
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server: ", error);
  }
};

StartServer();
