const express = require("express");
const userRouter = require("../routres/userroutes.js");
const taskRouters = require("../routres/taskroutes.js");

const app = express();

//Automatically converts json to object
app.use(express.json());

//User Routes are wirrten in a sperate file
app.use(userRouter);

//Tasks Routes are wirrten in a sperate file
app.use(taskRouters);

module.exports = app;
