const mongoose = require("mongoose");
const dbName = "pet_db";
const url = "mongodb+srv://backend:gL3j4SuUV4btRbu0@cluster0.bo4r6.mongodb.net/" + dbName + "?retryWrites=true&w=majority";

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});
