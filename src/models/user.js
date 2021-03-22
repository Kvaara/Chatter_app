const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    required: true,
    trim: true,
    unique: true,
    type: String,
  },
  messages: [
    {
      message: {
        type: String,
      },
      time: {
        type: String,
      },
    },
  ],
});

userSchema.statics.findUserAndAddMessage = async (username, message) => {
  console.log(username);
  const user = User.findOne({ username });

  console.log(user);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
