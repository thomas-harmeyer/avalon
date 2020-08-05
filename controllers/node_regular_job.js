var mongoController = require("./mongo-controller");
var seconds = 3000,
    the_interval = seconds * 1000;
setInterval(function () {
    console.log("I am doing my 5 minutes check");
    mongoController.connectToDb(function (db) {
        let collection = db.collection("games");
        collection.remove({});
    })
}, the_interval);