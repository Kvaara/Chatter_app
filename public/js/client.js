const enterForm = document.querySelector("#login-form");

const socket = io();

enterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const info = document.querySelector("#info");
  info.value = "";
  const username = event.target.elements.username.value;

  if (username.length > 15) {
    info.innerText = "Username can't be longer than 15 characters!";
  } else if (username.length < 3) {
    info.innerText = "Username can't be shorter than 3 characters!";
  } else {
    const user = {
      username,
    };

    const res = await fetch("/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.status === 400 && username !== "") {
      info.innerText = "Username already exists!";
    } else if (res.status === 400 && username === "") {
      info.innerText = "Username can't be empty!";
    } else {
      info.innerText = "Entering... ";
      socket.emit("entered", username, () => {
        console.log("Acknowledgement");
      });
      socket.emit("login", username, "main");
      buildApp(username, "main");
    }
  }
});
