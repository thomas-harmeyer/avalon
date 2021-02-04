const timeController = require("./time-controller");
const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");

const title = "Avalon";

function loadLanding(req, res) {
  res.clearCookie("code");
  res.clearCookie("username");
  res.render("landing", {
    title: title,
  });
}

function createLobby(req, res) {
  let username = req.body.username_copy;
  let code =
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString();
  mongoController.connectToDb().then((db) => db.collection("games").insertOne({
    code: code,
    updated: Date.now(),
    started: "false"
  }).then(function (err, result) {
    req.body.username = username;
    req.body.code = code;
    joinLobby(req, res);
  })).catch((err) => verifyController.onMongoDbException(err, res));
}

function joinLobby(req, res) {
  let username = req.body.username;
  let code = req.body.code;
  mongoController.connectToDb().then((function (db) {
    db.collection("games").updateOne({
      code: code,
    }, {
      $addToSet: {
        users: {
          username: username,
        },
      },
    }).then(function (result) {
      if (result.matchedCount === 0) {
        res.render("landing", {
          err: "Sorry that game does not exist",
          title: "Avalon",
        });
      } else {
        res.cookie("username", username, {
          maxAge: timeController.hour(24),
        });
        res.cookie("code", code, {
          maxAge: timeController.hour(24),
        });
        res.redirect("/games");
      }
    })
  }));
}

function removeUser(req, res) {
  let toDelete = JSON.parse(req.body.toDelete).username;
  if (!verifyController.verifyExists(toDelete)) {
    return;
  }
  mongoController.connectToDb().then(function (db) {
    let users = db.collection("games");
    users.updateMany({
      code: req.cookies.code,
    }, {
      $pull: {
        users: {
          username: toDelete
        },
      },
    });
  });
  loadLobby(req, res);
}

function loadLobby(req, res) {
  let username = req.cookies.username;
  let code = req.cookies.code;
  verifyController.verifyCredentials(username, code);
  mongoController.connectToDb().then((db) => {
    db.collection("games").findOne({
      code: code,
    }).then((result) => res.render("games", {
      games: result,
    }));
  }).catch((err) => verifyController.onMongoDbException(err, res));
}

module.exports = {
  loadLanding,
  createLobby,
  joinLobby,
  removeUser,
  loadLobby,
};