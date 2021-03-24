/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
const buildApp = (username, room) => {
  document.body.textContent = "";

  const div = document.createElement("div");
  div.className = "main-content";

  const h1 = document.createElement("h1");
  h1.innerText = `You are logged in as: ${username}`;

  const hr = document.createElement("hr");

  const strong = document.createElement("strong");
  strong.innerText = "Type a message in the chat!";

  const p1 = document.createElement("p");
  p1.innerText =
    "P.S. You can message others privately by tagging them with @ (e.g '@username hello username')";

  div.appendChild(h1);
  div.appendChild(hr);
  div.appendChild(strong);
  div.appendChild(p1);

  document.body.appendChild(div);

  const usersDiv = document.createElement("div");
  usersDiv.className = "usersDiv";

  const usersDivHeader = document.createElement("span");
  usersDivHeader.innerText = "Other users currently online:";
  usersDivHeader.className = "usersDivHeader";

  usersDiv.appendChild(usersDivHeader);

  const br = document.createElement("br");

  usersDiv.appendChild(br);

  document.body.appendChild(usersDiv);

  socket.on("status", (users, user, newRoom = "main") => {
    if (user.status === "online" && user.username !== username) {
      if (
        newRoom === "main" &&
        document.getElementsByClassName(`${user.username}`).length !== 1
      ) {
        const userOnline = document.createElement("div");
        userOnline.className = `${user.username}`;
        userOnline.id = user.username;
        const userOnlineSpan = document.createElement("span");
        userOnlineSpan.innerText = `${user.username}`;
        userOnlineSpan.className = "username";
        userOnline.appendChild(userOnlineSpan);
        usersDiv.appendChild(userOnline);
      }
    } else if (user.status === "online" && user.username === username) {
      users.forEach((User) => {
        if (User.username !== username) {
          const userOnline = document.createElement("div");
          userOnline.className = `${User.username}`;
          userOnline.id = User.username;
          const userOnlineSpan = document.createElement("span");
          userOnlineSpan.innerText = `${User.username}`;
          userOnlineSpan.className = "username";
          userOnline.appendChild(userOnlineSpan);
          usersDiv.appendChild(userOnline);
        }
      });
    } else {
      const userOffline = document.getElementById(`${user.username}`);
      if (userOffline !== null) {
        userOffline.remove();
      }
    }
  });

  const chatBox = document.createElement("div");
  chatBox.className = "chatBox";

  const chatForm = document.createElement("form");
  chatForm.className = "chat-container";

  const chatHeader = document.createElement("h2");
  chatHeader.innerText = `Chat (room: ${room})`;
  chatHeader.className = "chatHeader";

  const messages = document.createElement("ul");
  messages.className = "messages";

  const msgField = document.createElement("input");
  msgField.type = "text";
  msgField.className = "msgField";
  msgField.placeholder = "Enter your message...";
  msgField.name = "msgField";
  msgField.autocomplete = "off";

  const sendMsgBtn = document.createElement("button");
  sendMsgBtn.innerText = "Send";

  chatForm.appendChild(chatHeader);
  chatForm.appendChild(messages);
  chatForm.appendChild(msgField);
  chatForm.appendChild(sendMsgBtn);
  chatBox.appendChild(chatForm);

  const buttonDiv = document.createElement("div");
  buttonDiv.className = "buttons-container";

  const showMessagesBtn = document.createElement("button");
  showMessagesBtn.innerText = "Show sent messages";
  showMessagesBtn.type = "button";
  showMessagesBtn.id = "ShowMessages";

  const createRoomBtn = document.createElement("button");
  createRoomBtn.innerText = "Create room";
  createRoomBtn.type = "button";
  createRoomBtn.id = "createRoom";

  const joinRoomBtn = document.createElement("button");
  joinRoomBtn.innerText = "Join a room";
  joinRoomBtn.type = "button";
  joinRoomBtn.id = "joinRoom";

  buttonDiv.appendChild(showMessagesBtn);
  buttonDiv.appendChild(createRoomBtn);
  buttonDiv.appendChild(joinRoomBtn);

  if (room !== "main") {
    const backToMain = document.createElement("button");
    backToMain.className = "backToMain";
    backToMain.type = "button";
    backToMain.innerText = "Back to main";

    buttonDiv.appendChild(backToMain);

    backToMain.addEventListener("click", () => {
      buildApp(username, "main");
      socket.emit("newRoom", "main");
    });
  }

  chatBox.appendChild(buttonDiv);

  document.body.appendChild(chatBox);

  const sendMsgForm = document.querySelector(".chat-container");

  sendMsgForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const messageInput = event.target.elements.msgField.value;

    if (messageInput === "") {
      return alert("You have to type in a message!");
    }

    const isPrivateMessage = messageInput.substr(0, 1).includes("@");

    if (isPrivateMessage) {
      let toWhom = messageInput.substr(1, messageInput.indexOf(" "));
      const privateMessage = messageInput.substr(
        toWhom.length + 1,
        messageInput.length
      );
      toWhom = toWhom.substr(0, toWhom.length - 1);
      socket.emit("privateMessage", privateMessage, toWhom, username, () => {
        event.target.elements.msgField.value = "";
      });
    } else {
      socket.emit("message", messageInput, username, room, () => {
        event.target.elements.msgField.value = "";
      });
    }
  });

  socket.on("messageReceived", (message, user, roomName) => {
    if (roomName === room) {
      const item = document.createElement("li");
      if (username === user) {
        item.innerHTML = `<strong>${user}</strong><strong style="color: rgb(255, 127, 0)"> (you)</strong> : ${message}`;
      } else {
        item.innerHTML = `<strong>${user}</strong>: ${message}`;
      }
      item.className = "message";

      messages.appendChild(item);

      const allMessages = document.querySelectorAll("li");
      const last = allMessages[allMessages.length - 1];

      if (last) last.scrollIntoView();
    }
  });

  socket.on("privateMessageReceived", (privateMessage, to, from) => {
    if (username === from || username === to) {
      const item = document.createElement("li");
      if (username === from) {
        item.innerHTML = `<strong style="color: rgb(255, 127, 0)">(you)</strong><strong style="color: red"> => @${to}</strong> : ${privateMessage}`;
      } else {
        item.innerHTML = `<strong style="color: red">${from} => @</strong><strong style="color: rgb(255, 127, 0)">(you)</strong> : ${privateMessage}`;
      }
      item.className = "message";

      messages.appendChild(item);

      const allMessages = document.querySelectorAll("li");
      const last = allMessages[allMessages.length - 1];

      if (last) last.scrollIntoView();
    }
  });

  showMessagesBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const users = await res.json();
      let userMessages = "";
      for (let i = 0; i < users.length; i += 1) {
        if (users[i].username === username) {
          // eslint-disable-next-line no-loop-func
          users[i].messages.forEach((message) => {
            userMessages += `'${message.message}' (${message.time.substr(
              0,
              25
            )})\n `;
          });
        }
      }
      // eslint-disable-next-line no-alert
      alert(
        `You have sent the following messages (from top to bottom): \n ${userMessages}`
      );
    } catch (e) {
      console.log(`There was an error: ${e}`);
    }
  });

  createRoomBtn.addEventListener("click", async () => {
    const roomName = prompt("Type in the desired room name:");

    if (roomName === "") {
      alert("Room name can't be empty!");
    } else if (roomName.length < 3) {
      alert("Room name can't be less than 3 characters!");
    } else if (roomName.length > 15) {
      alert("Room name can't be more than 15 characters!");
    } else {
      const roomBody = {
        room_name: roomName,
      };

      const res = await fetch("/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomBody),
      });

      if (res.status === 201) {
        alert("Room has been created!");
      } else if (res.status === 400) {
        alert("Room already exists!");
      }
    }
  });

  joinRoomBtn.addEventListener("click", async () => {
    const res = await fetch("/rooms", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const rooms = await res.json();

    if (rooms.length === 0) {
      alert(
        "There are no rooms available.\nCreate one by clicking the 'Create a room' button."
      );
    } else {
      let roomArray = "";

      rooms.forEach((room) => {
        roomArray += `${room.room_name}\n`;
      });

      const roomName = prompt(
        `Available rooms:\n\n${roomArray}\nType in the room name below:`
      );

      if (roomArray.includes(roomName)) {
        buildApp(username, roomName);
        socket.emit("newRoom", roomName);
      } else {
        alert(`The room '${roomName}' does not exist!`);
      }
    }
  });
};
