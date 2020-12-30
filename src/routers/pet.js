const express = require("express");
const Pet = require("../models/pet");
const auth = require("../middleware/auth");
const router = new express.Router();

//TODO only for admin
router.post("/pet", auth, async (req, res) => {
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

// GET /pet?status=available
// GET /pet?type=cat&name=Bill
//TODO height weight
// GET /pet?limit=10&skip=20
// GET /pet?sortBy=createdAt:desc
// //delete auth here
//TODO global search
router.get("/pet", auth, async (req, res) => {
  const match = {};
  const sort = {};
  const allowedStatuses = new Set(["adopted", "fostered", "available"]); //TODO put to model

  // if (req.query.status && allowedStatuses.has(req.query.status)) {
  //   match.status = req.query.status;
  // }
  // if (req.query.type) {
  //   match.type = req.query.type;
  // }
  // if (req.query.name) {
  //   match.name = req.query.name;
  // }

  try {
    const pets = await Pet.find(match, null, {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    });
    console.log(pets);

    res.status(200).send(pets);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/pet/:id", auth, async (req, res) => {
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

//TODO only for admin
router.put("/pet/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "type",
    "breed",
    "gender",
    "status",
    "picture",
    "height",
    "weight",
    "color",
    "bio",
    "dietaryrestrictions",
    "hypoallergenic",
  ];
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
      pet[update] = req.body[update];
      if (
        update == "status" &&
        (pet[update] === "fostered" || pet[update] === "adopted")
      ) {
        pet.owner = req.user._id;
      }
    });
    await pet.save();
    res.status(200).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/pet/:id/adopt", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedTypes = new Set(["adopt", "foster"]);
  if (!updates.type) {
    return res.status(400).send({ error: "Invalid parameter!" });
  }
  if (!allowedTypes.has(update)) {
    return res.status(400).send({ error: "Invalid adopt type!" });
  }

  try {
    const pet = await pet.findOne({ _id: req.params.id });

    if (!pet) {
      return res.status(404).send();
    }
    if (updates.type === "adopt") {
      pet.status = "adopted";
    } else {
      pet.status = "fostered";
    }
    pet.owner = req.user._id;
    await pet.save();
    res.status(200).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/pet/:id/return", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const pet = await pet.findOne({ _id: req.params.id });

    if (!pet) {
      return res.status(404).send();
    }
    pet.status = "availiable";
    pet.owner = null;
    await pet.save();
    res.status(200).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/pet/:id", auth, async (req, res) => {
  try {
    const pet = await pet.findOneAndDelete({
      _id: req.params.id,
    });

    if (!pet) {
      res.status(404).send();
    }

    res.status(200).send(pet);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/pet/:id/save", auth, async (req, res) => {
  //   add pet to favorite
  // TODO
});
router.delete("/pet/:id/save", auth, async (req, res) => {
  //   delete pet from favorite
  // TODO
});

module.exports = router;
