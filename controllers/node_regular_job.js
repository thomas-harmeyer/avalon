var mongoController = require("./mongo-controller");
let timerMinutes = 5;
let timeInterval = timerMinutes * 60000;

let cutOffMinutes = 60;
let cutOffInterval = cutOffMinutes * 60000;
setInterval(function () {
    console.log("I am doing my 5 minutes check");
    mongoController.connectToDb(function (db) {
        let collection = db.collection("games");
        collection.remove({
            "updated": {
                $lte: Date.now() - (cutOffMinutes)
            }
        });
    })
}, timeInterval);