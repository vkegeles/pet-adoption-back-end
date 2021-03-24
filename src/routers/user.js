const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const { auth, isAdmin } = require("../middleware/auth");
const router = new express.Router();
const USER_STATUS = 1;

router.post("/signup", async (req, res) => {
  const user = new User(req.body);
  user.status = USER_STATUS;

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).send("Email used by another account");
    } else {
      res.status(400).send(e.message);
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send("Incorrect email or password");
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.status(201).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/user", isAdmin, async (req, res) => {
  const match = {};
  const sort = {};
  try {
    const users = await User.find(match, null, {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    });

    res.status(200).send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/user/me", auth, async (req, res) => {
  res.status(201).send(req.user);
});

router.patch("/user/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "firstname",
    "lastname",
    "email",
    "password",
    "phonenumber",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/user/me", isAdmin, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/user/me/pet/:id/save", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites.push(req.params.id);
  await user.save();
  res.send(user);
});
router.delete("/user/me/pet/:id/save", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites.pull(req.params.id);
  await user.save();
  res.send(user);
});
router.get("/user/me/pet/saved", auth, async (req, res) => {
  User.findById(req.user._id)
    .populate("favorites")
    .exec(function (err, user) {
      if (err) return handleError(err);
      user.favorites.map((pet) => console.log(pet));
      res.send(user.favorites);
    });
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

module.exports = router;
