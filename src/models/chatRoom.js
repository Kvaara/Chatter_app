const mongoose = require("mongoose");

const chatRoomSchema = mongoose.Schema({
  room_name: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  users: [
    {
      user: {
        type: String,
        trim: true,
      },
    },
  ],
});

const Room = mongoose.model("Room", chatRoomSchema);

module.exports = Room;
