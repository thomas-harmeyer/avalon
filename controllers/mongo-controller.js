var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var assert = require("assert");

function connectToDb(callback) {
  const url = "mongodb://localhost:27017";
  const dbName = "avalon";
  MongoClient.connect(url, function (err, client) {
    assert.strictEqual(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    callback(db);
    client.close();
  });
}

module.exports = {
  connectToDb,
};