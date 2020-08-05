var express = require("express");
var router = express.Router();

var assert = require("assert");

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

router.get("/", function (req, res) {
  res.cookie("code", "baa");
  let code = "baa";
  console.log("type is::::::::", code);
  if (!req.cookies) {
    res.cookie("test", Date.now());
  }
  res.render("landing", {
    title: "Avalon",
    code: code,
  });
});

router.post("/create_code", function (req, res) {
  console.log(Math.random());
  let code =
    Math.round(Math.random() * 10).toString() +
    Math.round(Math.random() * 10).toString() +
    Math.round(Math.random() * 10).toString() +
    Math.round(Math.random() * 10).toString();
  const url = "mongodb://localhost:27017";
  const dbName = "avalon";
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection("games").insertOne(
      {
        code: code,
        updated: Date.now(),
      },
      function (err, result) {
        console.log("insert result:", result);
        res.cookie("code", code);
        res.redirect("/");
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
    db.collection("games").updateOne(
      {
        code: code,
      },
      {
        $push: {
          users: username,
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
          res.redirect("/games?username=" + username + "&code=" + code);
        }
      }
    );
    client.close();
  });
});

router.get("/games", function (req, res) {
  let query = req.query;
  let username = query["username"];
  let code = query["code"];
  // Connection URL
  const url = "mongodb://localhost:27017";
  // Database Name
  const dbName = "avalon";
  // Use connect method to connect to the server
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    db.collection("games").findOne(
      {
        code: code,
      },
      function (err, result) {
        assert.equal(null, err);
        console.log(result);
        res.render("games", {
          games: result,
        });
      }
    );

    client.close();
  });
});

module.exports = router;
