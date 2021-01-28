var mongoController = require("./mongo-controller");
var assert = require("assert");
const {
    send
} = require("process");
var missionActive = false;
var suggestedUsers = {};

function createMission(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    console.log(req.body);
    suggestedUsers = req.body["users[]"];
    mongoController.connectToDb(function (db) {
        let collection = db.collection('missions');
        collection.findOne({
                code: code,
                active: "true"
            },
            function (err, res) {
                if (res == null) {
                    mongoController.connectToDb(function (db) {
                        let collection = db.collection('missions');
                        collection.insertOne({
                                code: code,
                                suggester: username,
                                suggestedUsers: suggestedUsers,
                                activeUsers: suggestedUsers,
                                active: "true"
                            },
                            function () {
                                missionActive = true;
                            }
                        )

                    });
                }
            }
        )

    });

}

function main(req, res) {
    let code = req.cookies.code;
    mongoController.connectToDb(function (db) {
        db.collection("games").findOne({
                code: code,
            },
            function (err, result) {
                res.render("main", {
                    missionSize: 3,
                    users: result.users
                });
            }
        );
    });
}


function voteMission(missionId, vote) {

}

function getCurrentMission(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    mongoController.connectToDb(function (db) {
        db.collection("missions").findOne({
                code: code,
                activeUsers: username
            },
            function (err, result) {
                res.send(result != null)
            });
    });
}

function vote(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    let failsToAdd = req.body.voteFail != undefined ? 1 : 0;

    mongoController.connectToDb(function (db) {
        db.collection("missions").updateOne({
                code: code,
                active: "true",
                activeUsers: username
            }, {
                $inc: {
                    votes: 1,
                    fails: failsToAdd
                },
                $pull: {
                    "activeUsers": username
                }
            },
            function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log(result);
                res.redirect('/main');
            });
    });
    mongoController.connectToDb(function (db) {
        db.collection("missions").updateMany({
            code: code,
            active: "true",
            activeUsers: {
                $exists: true,
                $ne: []
            }
        }, {
            $set: {
                "active": "false"
            }
        });
    });
}

function getAllMissions() {

}


module.exports = {

    createMission,
    getCurrentMission,
    vote,
    main
};