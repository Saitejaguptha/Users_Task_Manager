const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task.js");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value))
          throw new Error("You have entred Wrong Mail Address");
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) throw new Error("Age is less Than 18");
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password"))
          throw new Error("Password contains passowrd");
      },
    },
    avatars: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.getPublicProfile = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatars;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id }, process.env.JWT_AUT);

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

userSchema.statics.findIdByCreditinals = async (email, passowrd) => {
  try {
    const user = await User.findOne({ email });

    if (!user)
      throw new Error(
        "Email You Have trying to login is in the database!!!..."
      );

    const isMatch = await bcrypt.compare(passowrd, user.password);

    if (!isMatch) throw new Error("Password Does not Match with User email");

    return user;
  } catch (e) {
    throw e;
  }
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.statics.deleteUserAndTasks = async function (userId) {
  try {
    const user = this;

    await Task.deleteMany({ owner: userId });

    await user.deleteOne({ _id: userId });
  } catch (e) {
    throw e;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
