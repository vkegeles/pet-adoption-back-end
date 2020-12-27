const express = require("express");
const Pet = require("../models/pet");
const auth = require("../middleware/auth");
const router = new express.Router();

// //delete auth here
router.post("/pets", auth, async (req, res) => {
  const pet = new Pet({
    ...req.body,
  });

  try {
    await pet.save();
    res.status(201).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /pets?completed=true
// GET /pets?limit=10&skip=20
// GET /pets?sortBy=createdAt:desc
router.get("/pets", auth, async (req, res) => {
  const match = {};
  const sort = {};

  //TODO add filter here

  // if (req.query.completed) {
  //   match.completed = req.query.completed === "true";
  // }

  // if (req.query.sortBy) {
  //   const parts = req.query.sortBy.split(":");
  //   sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  // }

  try {
    await req.user
      .populate({
        path: "pets",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.pets);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/pets/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const pet = await pet.findOne({ _id, owner: req.user._id });

    if (!pet) {
      return res.status(404).send();
    }

    res.send(pet);
  } catch (e) {
    res.status(500).send();
  }
});

// router.patch("/pets/:id", auth, async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = ["description", "completed"];
//   const isValidOperation = updates.every((update) =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates!" });
//   }

//   try {
//     const pet = await pet.findOne({ _id: req.params.id });

//     if (!pet) {
//       return res.status(404).send();
//     }

//     updates.forEach((update) => (pet[update] = req.body[update]));
//     await pet.save();
//     res.send(pet);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

router.delete("/pets/:id", auth, async (req, res) => {
  try {
    const pet = await pet.findOneAndDelete({
      _id: req.params.id,
    });

    if (!pet) {
      res.status(404).send();
    }

    res.send(pet);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
