const app = require("./app.js");

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Sucessfully runing on port " + port);
});
