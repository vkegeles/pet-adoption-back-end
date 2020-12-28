const express = require("express");
const Pet = require("../models/pet");
const auth = require("../middleware/auth");
const router = new express.Router();

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
// //delete auth here
router.get("/pets", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.adopted) {
    if (req.query.adopted === 'true') {
      match.status = "adopted"
    }
  }
  if (req.query.fostered) {
    if (req.query.fostered === 'true') {
      match.status = "fostered"
    }
  }

  try {
    const pets = await MyModel.find(match, null, {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    }
    );

    res.send(pets);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/pets/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const pet = await pet.findOne({ _id });

    if (!pet) {
      return res.status(404).send();
    }

    res.send(pet);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/pets/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["status"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const pet = await pet.findOne({ _id: req.params.id });

    if (!pet) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      pet[update] = req.body[update]
      if (update == "status" && (pet[update] === "fostered" || pet[update] === "adopted")) {
        pet.owner = req.user._id
      }
    });
    await pet.save();
    res.send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

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
