const timeController = require("./time-controller");
const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");

const title = "Avalon";

function loadLanding(req, res) {
  // clear cookies
  res.clearCookie("code");
  res.clearCookie("username");

  // render landing page
  res.render("landing", {
    title: title,
  });
}

function createLobby(req, res) {
  if (req.cookies.code) {
    res.redirect("/games");
  }
  // get username from body and generate a new code and verify them
  let username = req.body.username_copy;
  let code =
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString();
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }
  // create a new empty game with given code and last update now
  mongoController.connectToDb().then((db) => db.collection("games").insertOne({
    code: code,
    updated: Date.now(),
    started: "false"
  }).then((result) => {
    req.body.username = username;
    req.body.code = code;
    joinLobby(req, res);
  })).catch((err) => verifyController.onMongoDbException(err, res));
}

// adds user to lobby set cookies and joins lobby and handles errors
function joinLobby(req, res) {
  // get creds and verify them
  let username = req.body.username;
  let code = req.body.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }
  // add user to game with given O.P.E.
  mongoController.connectToDb().then(((db) => db.collection("games").updateOne({
    code: code,
  }, {
    $addToSet: {
      users: {
        username: username,
      },
    },
  }).then(function (result) {
    if (result.matchedCount == 0) {
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
      req.cookies.username = username;
      req.cookies.code = code;
      res.redirect("/games");
    }
  }))).catch((err) => verifyController.onMongoDbException(err, res));
}

function removeUser(req, res) {
  // get user to delete from req and if it does not exist handle it
  let toDelete = JSON.parse(req.body.toDelete).username;
  if (!verifyController.verifyExists(toDelete)) {
    return;
  }

  // update game with code and pull user with the toDelete username
  mongoController.connectToDb().then((db) => db.collection("games").updateMany({
    code: req.cookies.code,
  }, {
    $pull: {
      users: {
        username: toDelete
      },
    },
  }));
  // redirect to lobby
  res.redirect("/games");
}

function loadLobby(req, res) {
  // get creds and verify them
  let username = req.cookies.username;
  let code = req.cookies.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }

  // find the game you're in and render it
  mongoController.connectToDb().then((db) => db.collection("games").findOne({
    code: code,
  }).then((result) => res.render("games", {
    games: result,
    numOfUsers: result.users.length
  }))).catch((err) => verifyController.onMongoDbException(err, res));
}

function getNumberOfUsersInLobby(req, res) {
  let username = req.cookies.username;
  let code = req.cookies.code;
  if (!verifyController.verifyCredentials(username, code)) {
    return;
  }
  mongoController.connectToDb().then((db) => db.collection("games").findOne({
    code: code,
  }).then((result) => res.send(result.users.length))).catch((err) => verifyController.onMongoDbException(err, res));
}

module.exports = {
  loadLanding,
  createLobby,
  joinLobby,
  removeUser,
  loadLobby,
  getNumberOfUsersInLobby
};