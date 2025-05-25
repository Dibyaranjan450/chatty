import express from "express";
import {
  getMessages,
  getUsersForSidebar,
  sentMessages,
} from "../controllers/index.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sentMessages);

export default router;
