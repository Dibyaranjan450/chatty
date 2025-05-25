import mongoose from "mongoose";
import { config } from "dotenv";
// import server from "./app.js";
import { server } from "./src/lib/socket.js";

config({ path: "./config.env" });

const MONGO_CONNECTION_STRING = process.env.MONGODB_URL.replace(
  "USERNAME",
  process.env.MONGODB_USERNAME
).replace("PASSWORD", process.env.MONGODB_PASSWORD);

mongoose
  .connect(MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((e) => {
    console.log("error", e);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Listening at PORT ${PORT}`);
});
