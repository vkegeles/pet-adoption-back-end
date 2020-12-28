const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      required: false,
      trim: true,
    },
    picture: String,
    height: String,
    weight: String,
    color: String,
    bio: String,
    diet: String,

    hypoallergenic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.virtual("users", {
//   ref: "user",
//   localField: "_id",
//   foreignField: "favorites",
// });

const pet = mongoose.model("Pet", petSchema);

module.exports = pet;
