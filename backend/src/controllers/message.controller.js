import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import createHttpError from "http-errors";

const { InternalServerError } = createHttpError;

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUser);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error);
    next(InternalServerError());
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: chatReceiverId } = req.params;
    const { _id: chatSenderId } = req.user;

    const messages = await Message.find({
      $or: [
        { senderId: chatSenderId, receiverId: chatReceiverId },
        { senderId: chatReceiverId, receiverId: chatSenderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller ", error);
    next(InternalServerError());
  }
};

export const sentMessages = async (req, res, next) => {
  try {
    const { _id: senderId } = req.user;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      const uplaodResponse = await cloudinary.uploader.upload(image);
      imageUrl = uplaodResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sentMessaegs controller: ", error);
    next(InternalServerError(error.message));
  }
};
