const express = require("express");
const userRouter = require("../routres/userroutes.js");
const taskRouters = require("../routres/taskroutes.js");

const app = express();

const port = process.env.PORT;

//Automatically converts json to object
app.use(express.json());

//User Routes are wirrten in a sperate file
app.use(userRouter);

//Tasks Routes are wirrten in a sperate file
app.use(taskRouters);

app.listen(port, () => {
  console.log("Sucessfully runing on port " + port);
});
