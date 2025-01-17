var timeController = require("../controllers/time-controller");
var assert = require("assert");
var mongoController = require("../controllers/mongo-controller");

function hasStarted(req, res) {
  let code = req.cookies.code;
  mongoController.connectToDb(function (db) {
    db.collection("games").findOne({
        code: code,
      },
      function (err, result) {
        res.send(result.started == 'true');


      });
  });
}

function assignRoles(req, res) {
  let code = req.cookies.code;
  let username = req.cookies.username;
  var users;
  mongoController.connectToDb(function (db) {
    db.collection("games").findOne({
        code: code,
      },
      function (err, result) {
        if (result.started == 'true') {
          loadNight(req, res);
          return;
        }
        assert.strictEqual(null, err);
        users = result.users;
        let bulkUpdate = [];
        let roles = getRoles(users.length);
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
        mongoController.connectToDb((db) => {
          let collection = db.collection("games");
          collection.bulkWrite(bulkUpdate, (err, result) => {
            loadNight(req, res);
          });
        });
      }
    );
  });
}

function loadNight(req, res) {
  let code = req.cookies.code;
  let username = req.cookies.username;
  mongoController.connectToDb((db) => {
    let collection = db.collection("games");
    collection.findOne({
        code: code,

      },
      (err, result) => {
        let users = "";
        if (result.users)
          users = result.users;
        else {
          res.redirect("/");
          return;
        }
        let role = {
          username: "",
          role: ""
        };
        let know = [];
        users.forEach((value, key) => {
          if (value.username == username) {
            role.username = value.username;
            role.role = value.role;
          }
        });
        switch (role.role) {
          case "Merlin":
            users.forEach((value, key) => {
              if (value.role == "Assassin") {
                know.push(value);
              } else if (value.role == "Morgana") {
                know.push(value);
              } else if (value.role == "Bad Knight") {
                know.push(value);
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
        res.render("night", {
          role: role,
          users: know,
        });
      }
    );
  });
}

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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
module.exports = {
  hasStarted,
  assignRoles,
  loadNight,
};