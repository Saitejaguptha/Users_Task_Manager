const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_AUT);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error("User not found or token invalid");

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(401).send("User Not Authorized!!");
  }
};

module.exports = auth;
