import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const { Unauthorized, InternalServerError, NotFound } = createHttpError;

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) next(Unauthorized("Unauthorized - No Token Provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) next(Unauthorized("Unauthorized - Invalid Token"));

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) next(NotFound("User not found"));

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error);
    next(InternalServerError());
  }
};
