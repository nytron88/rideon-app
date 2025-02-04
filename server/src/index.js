import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import http from "http";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

connectDB()
  .then(() => {
    server.on("error", (error) => {
      console.error(error);
    });

    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed: ", error);
  });

