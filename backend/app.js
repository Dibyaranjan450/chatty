import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter, messageRouter } from "./src/routes/index.js";
import { errorController } from "./src/controllers/index.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
console.log("SOCKET_CORS_ORIGIN", process.env.SOCKET_CORS_ORIGIN);
app.use(cors({ origin: process.env.SOCKET_CORS_ORIGIN, credentials: true }));

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.use(errorController);

export default app;
