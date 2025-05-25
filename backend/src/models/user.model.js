import mongoose from "mongoose";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

const { InternalServerError } = createHttpError;

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "User must a have email!"],
      unique: [true, "User with this email already exists!"],
    },
    fullName: {
      type: String,
      required: [true, "User must have a name!"],
      minlength: [3, "User name length must be more than 3"],
    },
    password: {
      type: String,
      required: [true, "User must have a password!"],
      minlength: [6, "Password must be atleast 6 characters!"],
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(InternalServerError(error.message));
  }
});

userSchema.pre("findByIdAndUpdate", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(InternalServerError(error.message));
  }
});

const User = mongoose.model("User", userSchema);

export default User;
