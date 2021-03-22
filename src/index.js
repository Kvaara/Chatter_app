const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");

require("./db/chatter_app_api.js");
const User = require("./models/user.js");
const Room = require("./models/chatRoom.js");

const publicDirectory = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(publicDirectory));
app.use(express.json());

const server = http.createServer(app);
const io = socketio(server);

let userOnline = [];

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("login", (user) => {
    console.log(user, "logged in");
    socket.on("sendLocation", (coordinates, acknowledgement) => {
      io.emit(
        "message",
        `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`
      );
      acknowledgement();
    });

    userOnline.push({ username: user, status: "online" });

    io.emit("status", userOnline, {
      username: user,
      status: "online",
    });

    socket.on("disconnect", async () => {
      console.log(user, "disconnected");
      socket.broadcast.emit("status", userOnline, {
        username: user,
        status: "offline",
      });

      userOnline = userOnline.filter((el) => el.username !== user);

      console.log(userOnline, "currently online");

      await User.findOneAndDelete({ username: user });
    });
    socket.on("message", async (message, username, room, acknowledgement) => {
      const newBody = {
        messages: [{ message, time: new Date() }],
      };

      const userUpdated = await User.updateOne(
        { username },
        { $push: newBody }
      );

      io.emit("messageReceived", message, user, room);
      acknowledgement();
    });

    socket.on(
      "privateMessage",
      async (privateMessage, to, from, acknowledgement) => {
        const newBody = {
          messages: [{ privateMessage, time: new Date() }],
        };

        const userUpdated = await User.updateOne(
          { username: from },
          { $push: newBody }
        );

        io.emit("privateMessageReceived", privateMessage, to, from);
        acknowledgement();
      }
    );
  });
});

app.post("/enter", async (req, res) => {
  try {
    const newUser = User(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.setHeader("Content-Type", "application/json");
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.setHeader("Content-Type", "application/json");
    res.send(rooms);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.post("/rooms", async (req, res) => {
  try {
    const newRoom = await Room(req.body);
    await newRoom.save();
    res.status(201).send(newRoom);
  } catch (e) {
    res.status(400).send(e);
  }
});

server.listen(port, () => {
  console.log("App is listening on port ", port);
});
