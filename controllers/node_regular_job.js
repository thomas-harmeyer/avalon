const mongoController = require("./mongo-controller");
const timeController = require("./time-controller");
const timeInterval = timeController.min(5);
const cutOffInterval = timeController.min(60);
removeOldGames();
setInterval(removeOldGames, timeInterval);

function removeOldGames() {
    console.log("I am doing my 5 minutes check");
    mongoController.connectToDb().then((db) => {
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
    mongoController.connectToDb().then((db) => {
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
}