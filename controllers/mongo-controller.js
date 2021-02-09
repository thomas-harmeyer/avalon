var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;


function connectToDb() {
  const url = "mongodb://localhost:27017";
  const dbName = "avalon";
  const connection = MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return connection.then(function (client) {
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    return db;
  });
}

module.exports = {
  connectToDb,
};