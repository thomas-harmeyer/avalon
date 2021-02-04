const timeController = require("./time-controller");
const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");


// check if your game has started
function hasStarted(req, res) {
  // get creds and verify them
  const username = req.cookies.code;
  const code = req.cookies.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }

  // return if a game has started given an O.P.E.
  mongoController.connectToDb().then((db) => db.collection("games").findOne({
    code: code,
  }).then(
    (result) => res.send(result.started == 'true')
  )).catch((err) => verifyController.onMongoDbException(err, res));
}

// assign roles to everyone in your game
// if the game has already started it will not assign roles and send you to night
function assignRoles(req, res) {
  // get creds and verify them
  const username = req.cookies.code;
  const code = req.cookies.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }

  // find the game given an O.P.E.
  mongoController.connectToDb().then((db) => db.collection("games").findOne({
    code: code,
  }).then((result) => {
    // if the game has started then don't assign roles instead go to night
    if (result.started == 'true') {
      loadNight(req, res);
      return;
    }

    // otherwise let users be the list of users in the game
    const users = result.users;
    let bulkUpdate = [];
    let roles = getRoles(users.length);

    // make the req used to update all users
    users.forEach((value, key) => {
      let username = value.username;
      bulkUpdate.push({
        updateOne: {
          filter: {
            code: code,
            "users.username": username,
          },
          update: {
            $set: {
              "users.$.role": roles.pop(),
              started: "true"
            },
          },
        },
      });
    });

    //write the bulkUpdate then load night
    mongoController.connectToDb().then((db) => db.collection("games").bulkWrite(bulkUpdate).then(() => loadNight(req, res)))
  }));
}

// loads night; finds your role and the other players you role should know
function loadNight(req, res) {
  // get creds and verify them
  const username = req.cookies.code;
  const code = req.cookies.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }


  mongoController.connectToDb().then((db) => db.collection("games").findOne({
    code: code,
  }).then((result) => {
    if (!verifyController.verifyExists(result.users, res)) {
      return;
    }
    const users = result.users;
    let user = {
      username: "",
      role: ""
    };

    // come-back check this to see if you can do users.username
    users.forEach((value, key) => {
      if (value.username == username) {
        user.username = value.username;
        user.role = value.role;
      }
    });

    let know = [];

    // go through all the players and check which ones you should know
    switch (user.role) {
      case "Merlin":
        users.forEach((player, key) => {
          if (player.role == "Assassin") {
            know.push(player);
          } else if (player.role == "Morgana") {
            know.push(player);
          } else if (player.role == "Bad Knight") {
            know.push(player);
          }
        });
        break;
      case "Percival":
        users.forEach((value, key) => {
          if (value.role == "Merlin" || value.role == "Morgana") {
            value.role = "Merlin or Morgana";
            know.push(value);
          }
        });
        break;
      case "Good Knight":
        break;
      case "Assassin":
        users.forEach((value, key) => {
          if (value.role == "Morgana") {
            know.push(value);
          } else if (value.role == "Bad Knight") {
            know.push(value);
          }
        });
        break;
      case "Morgana":
        users.forEach((value, key) => {
          if (value.role == "Assassin") {
            know.push(value);
          } else if (value.role == "Bad Knight") {
            know.push(value);
          }
        });
        break;
      case "Bad Knight":
        users.forEach((value, key) => {
          if (value.role == "Assassin") {
            know.push(value);
          } else if (value.role == "Morgana") {
            know.push(value);
          } else if (value.role == "Bad Knight") {
            if (value.username != username)
              know.push(value);
          }
        });
        break;
    }

    // render night with you and the players you know
    res.render("night", {
      role: user,
      users: know,
    });
  }))
}

// get random roles given some number of players in the game
function getRoles(numberOfPlayers) {
  let roles = ["Merlin", "Assassin", "Percival", "Morgana", "Good Knight"];
  while (roles.length < numberOfPlayers) {
    roles.push("Good Knight");
    if (roles.length < numberOfPlayers) {
      roles.push("Bad Knight");
    }
  }

  for (let i = 0; i < numberOfPlayers; i++) {
    let x = getRandomInt(numberOfPlayers);
    let y = getRandomInt(numberOfPlayers);
    let temp = roles[x];
    roles[x] = roles[y];
    roles[y] = temp;
  }
  return roles;
}

// literally just gets a random int given some max int; thanks js
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


module.exports = {
  hasStarted,
  assignRoles,
  loadNight,
};