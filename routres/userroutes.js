const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

require("../src/db/mongoose.js");
const User = require("../src/models/user.js");
const auth = require("../src/middleware/auth.js");
const { sendMail } = require("../src/Emails/accounts.js");

const router = new express.Router();

const uploads = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/gm))
      cb(new Error("Please Upload jpg,jpeg,png fomat only"));

    cb(undefined, true);
  },
});

///////////////////////////////////////////////////
//Route's
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await sendMail(
      user.email,
      user.name,
      "User Creataion",
      "User Creation Sucess in Task Manager  RESTAPI !!"
    );
    const userres = await user.save();

    const token = await userres.generateAuthToken();

    res.status(201).send({ userres: userres.getPublicProfile(), token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post(
  "/users/me/avatar",
  auth,
  uploads.single("avatar"),
  async (req, res) => {
    try {
      let buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();

      req.user.avatars = buffer;

      await sendMail(
        req.user.email,
        req.user.name,
        "Adding Avatar",
        `Added Avatar Sucess in Task Manager RESTAPI!! `
      );

      await req.user.save();

      res.send("Uploaded Profile Pic Sucess");
    } catch (err) {
      res.status(400).send();
    }
  },
  (error, req, res, next) => res.status(400).send({ error: error.message })
);

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findIdByCreditinals(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    await sendMail(
      user.email,
      user.name,
      "User LoggedIn",
      `User Logged Sucess in Task Manager RESTAPI!! \nuse Token:${token}`
    );

    res.status(200).send({ user: user.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await sendMail(
      req.user.email,
      req.user.name,
      "User LoggedOut",
      `User Loggedout Sucess in Task Manager RESTAPI!! `
    );

    await req.user.save();

    res.status(200).send("User Has logged Out");
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await sendMail(
      req.user.email,
      req.user.name,
      "LoggedOut All Users!!",
      `User Loggedout All users Sucess in Task Manager RESTAPI!!`
    );

    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users", async (req, res) => {
  try {
    const user = await User.find();

    console.log(user);

    res.send(user);
  } catch (e) {
    res.status(500).send("Error: " + e);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user.getPublicProfile());
});

router.get("/users/:id/avatars", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user && user.avatars)
      throw new Error("This Profile Has No Avatar's!!");

    res.set("Content-type", "image/jpg");
    res.send(user.avatars);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.patch("/users/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);

    const allowedUpdates = ["name", "email", "password", "age"];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.status(200).send(req.user.getPublicProfile());
  } catch (e) {
    res.status(404).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await User.deleteUserAndTasks(req.user._id);

    await sendMail(
      req.user.email,
      req.user.name,
      "Delted User",
      `Delted User Sucess in Task Manager RESTAPI!! `
    );

    res.status(201).send(req.user);
  } catch (e) {
    console.error("Error deleting user:", e);
    res.status(404).send(e);
  }
});

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatars = undefined;

    await sendMail(
      req.user.email,
      req.user.name,
      "Delted Avatar",
      `Delted Avatar Sucess in Task Manager RESTAPI!! `
    );

    await req.user.save();
    res.send("Delted Profile Sucess!");
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
