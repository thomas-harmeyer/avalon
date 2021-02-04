const mongoController = require("./mongo-controller");
const timeController = require("./time-controller");
const timeInterval = timeController.min(5);
const cutOffInterval = timeController.min(60);
setInterval(function () {
    console.log("I am doing my 5 minutes check");
    var removedLobbies = [];
    mongoController.connectToDb(function (db) {
        let collection = db.collection("games");
        collection.deleteMany({
            "updated": {
                $lte: Date.now() - (cutOffInterval)
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                }
                console.log("games deleted:" + res.result);
            }
        });
    });
    mongoController.connectToDb(function (db) {
        let collection = db.collection("missions");
        collection.deleteMany({
            "updated": {
                $lte: Date.now() - (cutOffInterval)
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                }
                console.log("missions deleted:" + res.result);
            }
        });
    });
}, timeInterval);