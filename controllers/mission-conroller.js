var mongoController = require("./mongo-controller");
var assert = require("assert");
let missionPersonCount = [{
        numOfPlayers: [2, 3, 2, 3, 3],
        numOfFails: [1, 1, 1, 1, 1]
    },
    {
        numOfPlayers: [2, 3, 4, 3, 4],
        numOfFails: [1, 1, 1, 1, 1]
    },
    {
        numOfPlayers: [2, 3, 3, 4, 4],
        numOfFails: [1, 1, 1, 2, 1]
    },
    {
        numOfPlayers: [3, 4, 4, 5, 5],
        numOfFails: [1, 1, 1, 2, 1]
    },
    {
        numOfPlayers: [3, 4, 4, 5, 5],
        numOfFails: [1, 1, 1, 2, 1]
    },
    {
        numOfPlayers: [3, 4, 4, 5, 5],
        numOfFails: [1, 1, 1, 2, 1]
    }
];
const {
    send
} = require("process");
var suggestedUsers = {};

function createMission(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    suggestedUsers = req.body["users[]"];
    if (!Array.isArray(suggestedUsers)) {
        suggestedUsers = [suggestedUsers];
    }
    getNextMissionCount(function (numOfUsers, numOfFails) {
        missionIsActive(function (err, obj) {
            if (obj == null) {
                mongoController.connectToDb(function (db) {
                    let collection = db.collection('missions');
                    collection.insertOne({
                        updated: Date.now(),
                        code: code,
                        suggester: username,
                        suggestedUsers: suggestedUsers,
                        activeUsers: suggestedUsers,
                        active: "true",
                        numberOfUsers: numOfUsers,
                        numOfFails: numOfFails
                    }, () => loadMain(req, res))
                });
            } else {
                loadMain(req, res);
            }
        }, code);
    }, code);
}

function getNextMissionCount(callback, code) {
    let numOfPlayers;
    mongoController.connectToDb(function (db) {
        db.collection("games").findOne({
            code: code,
        }, (function (err, res) {
            if (err) {
                console.log(err);
            }
            if (res != null)
                numOfPlayers = res.users.length;
        }));
    });
    mongoController.connectToDb(function (db) {
        db.collection("missions").find({
            code: code,
            active: "false"
        }).sort({
            update: 1
        }).toArray(function (err, res) {
            if (err) {
                console.log(err);
            }
            missionNumber = res.length;
            try {
                let numOfUsers = missionPersonCount[numOfPlayers - 5].numOfPlayers[missionNumber];
                let numOfFails = missionPersonCount[numOfPlayers - 5].numOfFails[missionNumber];
                callback(numOfUsers, numOfFails);
            } catch (indexOutOfBoundError) {
                console.log(indexOutOfBoundError);
                callback(0);
            }
        });
    })
}

function missionIsActive(callback, code) {
    mongoController.connectToDb(function (db) {
        let collection = db.collection('missions');
        collection.findOne({
                code: code,
                active: "true"
            },
            function (err, obj) {
                callback(obj != null, obj);
            });

    });
}

function loadMain(req, res) {
    var missionRes = [];
    let code = req.cookies.code;
    let username = req.cookies.username;
    mongoController.connectToDb(function (db) {
        db.collection("missions").find({
            code: code,
            active: "false"
        }).sort({
            update: 1
        }).toArray(function (err, res) {
            if (err) {
                console.log(err);
            }
            console.log(res);
            res.forEach(mission => missionRes.push(mission.fails < mission.numOfFails ? "pass" : mission.fails));
        });
    })
    missionIsActive(function (activeMission, missions) {
        mongoController.connectToDb(function (db) {
            db.collection("games").findOne({
                    code: code,
                },
                function (err, result) {
                    if (result == null) {
                        res.redirect("/");
                    } else {
                        if (activeMission) {
                            if (missions.activeUsers && missions.activeUsers.includes(username)) {
                                res.render("main", {
                                    missions: missionRes,
                                    state: "showOnMission",
                                    users: result.users
                                })
                            } else {
                                res.render("main", {
                                    missions: missionRes,
                                    state: "showWait"
                                })
                            }
                        } else {
                            getNextMissionCount((missionSize) => res.render("main", {
                                missions: missionRes,
                                state: "showMission",
                                missionSize: missionSize,
                                users: result.users
                            }), code);
                        }
                    }
                }
            );
        })
    }, code);
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

function getUserState(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    missionIsActive(function (activeMission, missions) {
        mongoController.connectToDb(function (db) {
            db.collection("games").findOne({
                    code: code,
                },
                function (err, result) {
                    if (result == null) {
                        res.redirect("/");
                    } else {
                        if (activeMission) {
                            if (missions.activeUsers && missions.activeUsers.includes(username)) {
                                res.send("showOnMission");
                            } else {
                                res.send("showWait");
                            }
                        } else {
                            res.send("showMission");
                        }
                    }
                }
            );
        })
    }, code);
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

                checkForInactiveMissions(
                    () => res.redirect('/main'), code);
            });
    });

}

function checkForInactiveMissions(callback, code) {
    mongoController.connectToDb(function (db) {
        db.collection("missions").updateMany({
            code: code,
            active: "true",
            activeUsers: {
                $exists: true,
                $eq: []
            }
        }, {
            $set: {
                active: "false"
            }
        }, callback);
    });
}

function getAllMissions() {

}


module.exports = {

    createMission,
    getCurrentMission,
    vote,
    loadMain,
    getUserState
};