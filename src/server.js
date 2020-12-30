const express = require("express");
require("./db/mongoose");
require("dotenv").config();
const userRouter = require("./routers/user");
const petRouter = require("./routers/pet");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.append(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type,Content-Type, Authorization"
  );
  next();
});

app.use(userRouter);
app.use(petRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
