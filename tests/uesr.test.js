const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.js");
const { UserOne, deleteData, closeConnection } = require("./fixtures/db.js");

jest.setTimeout(10000);

beforeEach(deleteData);

test("Creating a User", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Saiteja Dubakunta",
      email: "dubakuntasaiteja@gmail.com",
      password: "MyPass77!",
    })
    .expect(201);

  const user = await User.findById(response.body.userres._id);
  expect(user).not.toBeNull();

  expect(response.body.userres).toMatchObject({
    name: "Saiteja Dubakunta",
    email: "dubakuntasaiteja@gmail.com",
  });

  expect(user.password).not.toBe("MyPass77!");
});

test("Shoul login the User", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: UserOne.email,
      password: UserOne.password,
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);

  expect(user.tokens.length).toBe(2);

  expect(user.tokens[1].token).toBe(response.body.token);
});

test("Shoul Not login the User", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: UserOne.email,
      password: "UserOnepassword",
    })
    .expect(400);
});

test("Should not get the User deetails", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should Get The User Profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not delete", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should delete a User", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send()
    .expect(201);

  const user = await User.findById(UserOne.userid);
  expect(user).toBeNull();
});

test("For Uploading The avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(UserOne._id);
  expect(user.avatars).toEqual(expect.any(Buffer));
});

test("Updating the user deatils", async () => {
  const resposne = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send({
      name: "Dubakunta Saiteja",
    })
    .expect(200);

  const user = await User.findById(resposne.body._id);

  expect(user.name).toBe("Dubakunta Saiteja");
});

test("Updating the user deatils", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${UserOne.tokens[0].token}`)
    .send({
      name: "Dubakunta Saiteja",
      location: "New Delhi",
    })
    .expect(400);
});

afterAll(closeConnection);
