const mongoose = require("mongoose");
require("dotenv").config();

const dbName = "pet_db";
const url = `mongodb+srv://backend:${process.env.PASSWORD}@cluster0.bo4r6.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});
