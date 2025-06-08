const express = require("express");

require("../src/db/mongoose.js");
const Task = require("../src/models/task.js");
const auth = require("../src/middleware/auth.js");
const { sendMail } = require("../src/Emails/accounts.js");

const routers = new express.Router();

routers.post("/tasks", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });

    await sendMail(
      req.user.email,
      req.user.name,
      "Task Creataion",
      `Task Creation Sucess in Task Manager  RESTAPI for ${req.user.name}\nDesc: ${task.description}`
    );

    const taskres = await task.save();

    res.status(201).send(taskres);
  } catch (err) {
    res.status(400).send(err);
  }
});

routers.get("/tasks", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) match.completed = req.query.completed === "true";
    if (req.query.sortBy) {
      const part = req.query.sortBy.split(":");
      sort[part[0]] = part[1] === "desc" ? 1 : -1;
    }

    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(500);
  }
});

routers.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;

    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(400).send("No Task with porvided id");

    res.status(200).send(task);
  } catch (e) {
    res.status(500);
  }
});

routers.patch("/tasks/:id", auth, async (req, res) => {
  try {
    const tasks = Object.keys(req.body);
    const allowedtask = ["description", "completed"];
    const isValidOperation = tasks.every((task) => allowedtask.includes(task));

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send("No Task Found with the id");

    tasks.forEach((t) => (task[t] = req.body[t]));

    await task.save();

    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

routers.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send("No Task Found with the id");

    await sendMail(
      req.user.email,
      req.user.name,
      "Task Deleted",
      `Task Deleted Sucess in Task Manager  RESTAPI for ${req.user.name}\nDes: ${task.description}`
    );

    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = routers;
