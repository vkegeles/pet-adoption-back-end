const express = require("express");
const Pet = require("../models/pet");
const { auth, isAdmin } = require("../middleware/auth");
const router = new express.Router();

router.post("/pet", isAdmin, async (req, res) => {
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
// GET /pet?type=Cat&name=Bill
//TODO height weight
// GET /pet?limit=10&skip=20
// GET /pet?sortBy=createdAt:desc
// //delete auth here
//TODO global search
router.get("/pet", async (req, res) => {
  let match = {};
  const sort = {};

  console.log("search2", req.query);
  console.log("search3", req.query.search);
  if (req.query.search) {
    match = { $text: { $search: req.query.search } };
  }
  const allowedStatuses = new Set(["adopted", "fostered", "available"]);

  if (req.query.status && allowedStatuses.has(req.query.status)) {
    match.status = req.query.status;
  }
  if (req.query.type) {
    match.type = req.query.type;
  }
  // if (req.query.name) {
  //   match.name = req.query.name;
  // }

  try {
    const pets = await Pet.find(
      match,
      ["name", "type", "gender", "status", "picture"],
      {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      }
    );
    // console.log(pets);

    res.status(200).send(pets);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/pet/:id", async (req, res) => {
  const _id = req.params.id;
  console.log(_id);

  try {
    const pet = await Pet.findOne({ _id });

    if (!pet) {
      return res.status(404).send();
    }
    console.log(pet);

    res.send(pet);
  } catch (e) {
    console.log(e);

    res.status(500).send(e);
  }
});

router.put("/pet/:id", isAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  console.log("updates", updates);
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
    const pet = await Pet.findOne({ _id: req.params.id });
    console.log("pet", pet);
    if (!pet) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      pet[update] = req.body[update];
      if (update == "status" && pet[update] === "available") {
        pet.owner = null;
      }
    });
    await pet.save();
    res.status(200).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/pet/:id/adopt", auth, async (req, res) => {
  const updates = req.body;
  console.log(updates);
  console.log(updates.type);

  const allowedTypes = new Set(["adopt", "foster"]);
  if (!updates.type) {
    return res.status(400).send({ error: "Invalid parameter!" });
  }
  if (!allowedTypes.has(updates.type)) {
    return res.status(400).send({ error: "Invalid adopt type!" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.id });

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
  try {
    const pet = await Pet.findOne({ _id: req.params.id });

    if (!pet) {
      return res.status(404).send();
    }
    pet.status = "available";
    pet.owner = null;
    await pet.save();
    res.status(200).send(pet);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/pet/user/:id", async (req, res) => {
  // match.owner = req.param.id;
  console.log(req.params.id);

  try {
    const pets = await Pet.find({ owner: req.params.id });
    // console.log(pets);

    res.status(200).send(pets);
  } catch (e) {
    res.status(500).send();
  }
});

// router.delete("/pet/:id", isAdmin, async (req, res) => {
//   try {
//     const pet = await Pet.findOneAndDelete({
//       _id: req.params.id,
//     });

//     if (!pet) {
//       res.status(404).send();
//     }

//     res.status(200).send(pet);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

module.exports = router;
