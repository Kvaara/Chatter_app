const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017/chatter_app_api";

const connection = async () => {
  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log("connection established successfully");
  } catch (e) {
    console.log("Could not establish a connection with the database");
  }
};

connection();
