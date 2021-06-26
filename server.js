let express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let users = {};

let GAMES_STORE = {};
const NAMES_SET = ["Tarsha", "Rosemary", "Florene", "Chassidy", "Sherice", "Mana", "Loise", "Laine", "Oleta", "Florine", "Shyla", "Roxanna", "Bebe", "Ferne", "Brooks", "Lore", "Tonya", "Nicolas", "Esta", "Chastity", "Rosalba", "Marylin", "Cassaundra", "Dayle", "Linnie", "Trudi", "Verdell", "Rachal", "Terry", "Thomasine", "Else", "Blair", "Marlene", "Dortha", "Selma", "Misha", "Dorcas", "Magnolia", "Rosanne", "Venita", "Larisa", "Aubrey", "Al", "Ferdinand", "Margarett", "Debera", "Tamra", "Avis", "Carissa", "Steffanie"];
const COLOR_SET = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey", "black"];

let botUser = {
  fullname: "Admin",
  id: "WHO_NEEDS_ID",
  color: getRandomColor(),
  ip: "127.0.0.1",
};

app.use("/", express.static("public"));

app.get("/api", (req, res) => {
  res.json({ status: true });
});

let allCards = ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK", "SA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK", "HA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "DA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK", "CA" ];

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function shaffle(ordered) {
  const newSet = ordered.slice();
  const ready = [];

  for (let i = newSet.length; i > 0; i--) {
    let r = generateRandomNumber(0, i);
    ready.push(newSet.splice(r, 1)[0]);
  }
  return ready;
}

function randomName() {
  const randomNameIndex = generateRandomNumber(0, NAMES_SET.length - 1);

  return NAMES_SET[randomNameIndex];
}

function getRandomColor() {
  let rIndex = generateRandomNumber(0, COLOR_SET.length);
  return COLOR_SET[rIndex];
}

let shuffled = shaffle(allCards);

function reShuffleCards() {
  shuffled = shaffle(allCards);
  let shuffledSet = [];
  for (let i = 0; i < shuffled.length; ) {
    for (let j = 0; j < Object.keys(users).length && i < shuffled.length; j++) {
      if (Array.isArray(shuffledSet[j])) {
        shuffledSet[j].push(shuffled[i++]);
      } else {
        shuffledSet[j] = [shuffled[i++]];
      }
    }
  }

  let c = 0;

  Object.values(users).forEach((user) => {
    io.to(user.socketId).emit("CARD_SHUFFLED", { cards: shuffledSet[c++] });
  });
}

function getRoom(clientSessionId) {
  let userRoomFound = false;

  Object.values(GAMES_STORE).forEach((room) => {
    if (room.users.indexOf(clientSessionId) !== -1) {
      userRoomFound = room;
    }
  });
  return userRoomFound;
}

function handle_NEW_ROOM(data, clientDetails) {
  console.log("request NEW_ROOM");
  if (!getRoom(clientDetails.id)) {
    let roomCreatedAt = Date.now();
    let roomDetails = {
      id: roomCreatedAt,
      title: data.title,
      admin: clientDetails.id,
      users: [clientDetails.id],
      createdAt: roomCreatedAt,
    };

    GAMES_STORE[roomCreatedAt] = roomDetails;
    console.log("ROOM STORE", GAMES_STORE);
    io.emit("ROOMS_UPDATED", GAMES_STORE);
  }
}

function removeDependentRooms(userId) {
  Object.values(GAMES_STORE).forEach((game) => {
    let userIndex = game.users.indexOf(userId);
    if (userIndex > -1) {
      GAMES_STORE[game.id].users.splice(userIndex, 1);
    }
  });
}

function handle_JOIN_ROOM(data, clientDetails) {
  console.log("request JOIN_ROOM");
  if (!getRoom(clientDetails.id)) {
    GAMES_STORE[data.roomId].users.push(clientDetails.id);
    console.log("ROOM STORE", GAMES_STORE);
    io.emit("USER_JOIN_ROOM", GAMES_STORE);
  }
}

io.on("connection", (client) => {
  let clientSessionId;
  let username;

  console.log("sessionId", client.handshake.query.sessionId);

  if (client.handshake.query.sessionId == "0") {
    username = randomName();
    clientSessionId = Date.now();
    client.emit("SESSION_ID", { sessionId: clientSessionId });
  } else {
    username = client.handshake.query.username;
    clientSessionId = client.handshake.query.sessionId;
  }

  users[clientSessionId] = {
    fullname: username,
    id: clientSessionId,
    socketId: client.id,
    color: getRandomColor(),
    ip: client.request.connection.remoteAddress.replace("::ffff:", ""),
    isNewUser: true,
  };

  client.emit("MY_DETAILS", users[clientSessionId]);

  io.emit("ROOMS_UPDATED", GAMES_STORE);

  io.emit("USERS_UPDATE", { users: users });

  client.on("NAME_UPDATE", (data) => {
    console.log("request NAME_UPDATE");
    io.emit("NEW_CHAT", {
      user: botUser,
      text: `<span><i>${users[clientSessionId].fullname}</i> changed name to <i>${data.fullname}</i><span>`,
    });
    users[clientSessionId]["fullname"] = data.fullname;
    client.emit("MY_DETAILS", users[clientSessionId]);
    io.emit("USERS_UPDATE", { users: users });
  });

  client.on("JOIN", (data) => {
    console.log("request JOIN");
    io.emit("NEW_JOIN", { user: users[clientSessionId] });
  });

  client.on("SHUFFLE_CARDS", (data) => {
    console.log("request SHUFFLE_CARDS");
    io.emit("DISCARD", {});
    io.emit("NEW_CHAT", {
      user: users[clientSessionId],
      text: `<i style="color: green;">discards all cards</i>`,
    });
    reShuffleCards();
    io.emit("NEW_CHAT", {
      user: users[clientSessionId],
      text: `<i style="color: blue;">starts a new game</i>`,
    });
  });

  client.on("NEW_CHAT", (data) => {
    console.log("request NEW_CHAT");
    io.emit("NEW_CHAT", { user: users[clientSessionId], text: data.text });
  });

  client.on("DISCARD", (data) => {
    console.log("request DISCARD");
    io.emit("DISCARD", {});
    io.emit("NEW_CHAT", {
      user: users[clientSessionId],
      text: `<i style="color: green;">discards all cards</i>`,
    });
  });

  client.on("TAKE_ALL", (data) => {
    console.log("request TAKE_ALL");
    io.emit("DISCARD", {});
    io.emit("NEW_CHAT", {
      user: users[clientSessionId],
      text: `<i style="color: red;">takes all cards</i>`,
    });
  });

  client.on("ADD_TO_TABLE", (data) => {
    console.log("request ADD_TO_TABLE");
    io.emit("TABLE_UPDATED", {
      card: { title: data.card },
      user: users[clientSessionId],
    });
  });

  client.on("NEW_ROOM", (data) => {
    handle_NEW_ROOM(data, users[clientSessionId]);
  });

  client.on("JOIN_ROOM", (data) => {
    handle_JOIN_ROOM(data, users[clientSessionId]);
  });

  client.on("disconnect", () => {
    removeDependentRooms(clientSessionId);
    delete users[clientSessionId];
    io.emit("USERS_UPDATE", { users: users });
    console.log("updated users", users);
    console.log("disconnected");
  });
});

http.listen(process.env.PORT, () => {
  console.log(`Server started at: http://localhost:${process.env.PORT}`);
});
