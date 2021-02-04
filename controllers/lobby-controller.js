var timeController = require("../controllers/time-controller");
var assert = require("assert");
var mongoController = require("../controllers/mongo-controller");

function loadLanding(req, res) {
  res.clearCookie("code");
  res.clearCookie("username");
  let code = "";
  if (req.query.code) {
    code = req.query.code;
  }
  res.render("landing", {
    title: "Avalon",
    code: code,
  });
}

function createLobby(req, res) {
  let username = req.body.username_copy;
  let code =
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString();
  mongoController.connectToDb(function (db) {
    db.collection("games").insertOne({
        code: code,
        updated: Date.now(),
        started: "false"
      },
      function (err, result) {
        req.body.username = username;
        req.body.code = code;
        joinLobby(req, res);
      }
    );
  });
}

function joinLobby(req, res) {
  let username = req.body.username;
  let code = req.body.code;
  mongoController.connectToDb(function (db) {
    db.collection("games").updateOne({
        code: code,
      }, {
        $addToSet: {
          users: {
            username: username,
          },
        },
      },
      function (err, result) {
        if (err) {
          console.log(err);
          res.render("landing", {
            err: err,
          });
        } else if (result.matchedCount === 0) {
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
      }
    );
  });
}

function removeUser(req, res) {
  let toDelete = JSON.parse(req.body.toDelete).username;
  mongoController.connectToDb(function (db) {
    let users = db.collection("games");
    users.update({
      code: req.cookies.code,
    }, {
      $pull: {
        users: {
          username: toDelete
        },
      },
    }, {
      multi: true
    });
  });
  res.redirect("/games");
}

function loadLobby(req, res) {
  let username = req.cookies.username;
  let code = req.cookies.code;
  mongoController.connectToDb(function (db) {
    db.collection("games").findOne({
        code: code,
      },
      function (err, result) {
        assert.strictEqual(null, err);
        res.render("games", {
          games: result,
        });
      }
    );
  });
}

module.exports = {
  loadLanding,
  createLobby,
  joinLobby,
  removeUser,
  loadLobby,
};