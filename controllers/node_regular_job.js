var mongoController = require("./mongo-controller");
let timerMinutes = 5;
let timeInterval = timerMinutes * 60000;
let cutOffMinutes = 60;
let cutOffInterval = cutOffMinutes * 60000;
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
                console.log(res.result);
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
                console.log(res.result);
            }
        });
    });
}, timeInterval);