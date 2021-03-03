const express = require("express");
require("./db/mongoose");
require("dotenv").config();
const userRouter = require("./routers/user");
const petRouter = require("./routers/pet");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

app.use(express.json());

app.use(userRouter);
app.use(petRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
