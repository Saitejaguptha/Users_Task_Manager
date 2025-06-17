const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user.js");
const Task = require("../../src/models/task.js");

const userid = new mongoose.Types.ObjectId();
const user2id = new mongoose.Types.ObjectId();

const UserOne = {
  _id: userid,
  name: "Dubakunta Saiteja",
  age: 25,
  email: "saitejguptha111@gmail.com",
  password: "Saiteja@10",
  tokens: [
    {
      token: jwt.sign({ _id: userid }, process.env.JWT_AUT),
    },
  ],
};

const UserTwo = {
  _id: user2id,
  name: "Lingam Vishnu",
  age: 25,
  email: "lingamvishnu@gmail.com",
  password: "Vishnu@10",
  tokens: [
    {
      token: jwt.sign({ _id: user2id }, process.env.JWT_AUT),
    },
  ],
};

const TaskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "One Task!!!",
  completed: true,
  owner: userid,
};

const TaskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Two Task!!!",
  completed: true,
  owner: user2id,
};

const TaskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Three Task!!!",
  completed: false,
  owner: user2id,
};

const deleteData = async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await new User(UserOne).save();
  await new User(UserTwo).save();
  await new Task(TaskOne).save();
  await new Task(TaskTwo).save();
  await new Task(TaskThree).save();
};

const closeConnection = async () => {
  await mongoose.connection.close();
};

module.exports = {
  userid,
  UserOne,
  deleteData,
  closeConnection,
  TaskOne,
  TaskThree,
  UserTwo,
};
