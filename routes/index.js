var express = require("express");
var router = express.Router();

var assert = require("assert");

var mongoController = require("../controllers/mongo-controller");
var timeController = require("../controllers/time-controller");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

router.get("/", function (req, res, next) {
  let code = "";;
  console.log(req.query);
  if (req.query.code) {
    code = req.query.code;
  }
  res.render("landing", {
    title: "Avalon",
    code: code,
  });
});

router.post("/create_code", function (req, res) {
  console.log("username", req.body.username);
  let code =
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString() +
    Math.floor(Math.random() * Math.floor(10)).toString();
  const url = "mongodb://localhost:27017";
  const dbName = "avalon";
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection("games").insertOne({
        code: code,
        updated: Date.now(),
      },
      function (err, result) {
        res.redirect("/?code=" + code);
      }
    );
    client.close();
  });
});
router.post("/", function (req, res) {
  let username = req.body.username;
  let code = req.body.code;
  console.log("username", username);
  console.log("code", code);
  const url = "mongodb://localhost:27017";
  const dbName = "avalon";
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection("games").updateOne({
        code: code,
      }, {
        $addToSet: {
          users: username,
        },
      }, {
        upsert: true
      },
      function (err, result) {
        if (err) {
          console.log("error", err);
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
            maxAge: timeController.hour(24)
          });
          res.cookie("code", code, {
            maxAge: timeController.hour(24)
          });
          res.redirect("/games");
        }
      }
    );
    client.close();
  });
});

router.get("/games", function (req, res) {
  let username = req.cookies.username;
  let code = req.cookies.code;
  // Connection URL
  const url = "mongodb://localhost:27017";
  // Database Name
  const dbName = "avalon";
  // Use connect method to connect to the server
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    db.collection("games").findOne({
        code: code,
      },
      function (err, result) {
        assert.equal(null, err);
        console.log("Found 1 result:", result);
        res.render("games", {
          games: result,
        });
      }
    );

    client.close();
  });
});
router.post("/remove_user", function (req, res) {
  let toDelete = req.body.toDelete;
  console.log("toDelete", toDelete);
  mongoController.connectToDb(function (db) {
    let users = db.collection("games");
    users.update({
      "code": req.cookies.code
    }, {
      $pull: {
        users: toDelete
      }
    });
  });
  res.redirect("/games");
});

module.exports = router;