import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required!"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver ID is required!"],
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

messageSchema.pre("validate", function (next) {
  if (!this.text && !this.image) {
    return next(new Error("Either text or image must be provided."));
  }

  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
