const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task.js");
const {
  UserOne,
  deleteData,
  closeConnection,
  TaskOne,
  TaskThree,
  UserTwo,
} = require("./fixtures/db.js");
const task = require("../src/models/task.js");

beforeAll(deleteData);

test("Sholud Create a Task", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send({
      description: "Setting Up Production Database",
      completed: true,
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
});

test("Fetch User Tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toBe(2);
});

test("Updating A user deatils", async () => {
  const response = await request(app)
    .patch(`/tasks/${TaskThree._id}`)
    .set("Authorization", `Bearer ${UserTwo.tokens[0].token}`)
    .send({
      description: "Setting Up Production Database",
      completed: true,
    })
    .expect(200);

  expect(response.body.description).toEqual("Setting Up Production Database");
});

test("Deleteing the User", async () => {
  const response = await request(app)
    .delete(`/tasks/${TaskOne._id}`)
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(response.body._id);
  expect(task).toBeNull();
});

afterAll(closeConnection);
