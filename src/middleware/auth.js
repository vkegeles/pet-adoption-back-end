const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const ADMIN_STATUS = 2;

const isAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const user = await verifyToken(token);
    if (!user) {
      throw new Error();
    }
    if (user.status === ADMIN_STATUS) {
      next();
    } else {
      res.status(403).send({ error: " User hasn`t access" });
    }
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const user = await verifyToken(token);

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    return user;
  } catch (err) {
    return null;
  }
};

module.exports = { auth, isAdmin };
