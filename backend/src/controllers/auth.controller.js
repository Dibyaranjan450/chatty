import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const { BadRequest, InternalServerError, MethodNotAllowed, Unauthorized } =
  createHttpError;

export const signup = async (req, res, next) => {
  try {
    const { email, fullName, password } = req.body;

    const newUser = await User.create({ email, fullName, password });
    const { password: _, __v: __, ...filteredUser } = newUser.toObject();

    if (newUser) {
      generateToken(newUser._id, res);

      return res.status(201).json({
        satus: "success",
        success: true,
        data: filteredUser,
      });
    } else {
      return next(InternalServerError("Something went wrong!"));
    }
  } catch (error) {
    console.log("Errr in signup controller:  ", error);
    next(BadRequest(error.message));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(BadRequest("Email & password required!"));
    }

    const user = await User.findOne({ email });
    if (!user) return next(Unauthorized("Invalid credentials!"));

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) return next(Unauthorized("Invalid credentials!"));

    generateToken(user._id, res);

    const { password: _, __v: __, ...filteredUser } = user.toObject();
    res.status(200).json({
      status: "success",
      success: true,
      data: filteredUser,
    });
  } catch (error) {
    console.log("Error in login controller: ", error);
    next(InternalServerError());
  }
};

export const logout = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({
      status: "success",
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.log("Error in logout controller: ", error);
    next(InternalServerError());
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { profilePic, password } = req.body;

    let newPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(password, salt);
    }

    let imageUrl;
    if (profilePic) {
      const uploadResponce = await cloudinary.uploader.upload(profilePic);
      imageUrl = uploadResponce.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        ...(newPassword ? { password: newPassword } : {}),
        ...(imageUrl ? { profilePic: imageUrl } : {}),
      },
      { new: true }
    ).select("-password -__v");

    res.status(200).json({
      status: "success",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateProfile: ", error);
    next(BadRequest(error.message));
  }
};

export const checkAuth = (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    next(InternalServerError());
  }
};
