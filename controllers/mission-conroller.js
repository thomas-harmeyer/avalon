const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");
// the uses [num of players-5][mission number] for both arrays
// note both arrays are 0 indexed so use [player-5][mission]
const missionPersonCount = [{
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

function createMission(req, res) {
    // get creds and verify them
    const username = req.cookies.username;
    const code = req.cookies.code;
    if (!verifyController.verifyCredentials(username, code)) {
        return;
    }

    //get suggested users and hope to god it works
    suggestedUsers = req.body["users[]"];
    if (!verifyController.verifyExists(suggestedUsers, res)) {
        return;
    }
    if (!Array.isArray(suggestedUsers)) {
        suggestedUsers = [suggestedUsers];
    }

    //this is so terrible and I am going to have to spend so much time fixing it
    getNextMissionCount(code).next((res) => {
        missionIsActive().then((obj) => {
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
                        numberOfUsers: res.numOfUsers,
                        numOfFails: res.numOfFails
                    }).then(() => res.redirect("/main"))
                });
            } else {
                res.redirect("/main");
            }
        });
    });
}

function getNextMissionCount(code) {
    let numOfPlayers, missionNumber;
    mongoController.connectToDb().next(db.collection("games").findOne({
        code: code,
    }).next((res) => {
        numOfPlayers = res.users.length;
        db.collection("missions").find({
            code: code,
            active: "false"
        }).sort({
            update: 1
        }).toArray().next((res) => {
            missionNumber = res.length;
            if (numOfPlayers - 5 <= 0 || missionNumber <= 0) {
                console.log("out of bounds");
                return {
                    numOfUsers: 0,
                    numOfFails: 0
                };
            }
            let numOfUsers = missionPersonCount[numOfPlayers - 5].numOfPlayers[missionNumber];
            let numOfFails = missionPersonCount[numOfPlayers - 5].numOfFails[missionNumber];
            return {
                numOfUsers: numOfUsers,
                numOfFails: numOfFails
            };
        });
    })).catch((err) => {
        verifyController.onMongoDbException(err, res);
    });

}

function missionIsActive(code) {
    mongoController.connectToDb(function (db) {
        let collection = db.collection('missions');
        collection.findOne({
            code: code,
            active: "true"
        }).next((obj) => {
            return (obj);
        });
    });
}

function loadMain(req, res) {
    var missions = [];
    let code = req.cookies.code;
    let username = req.cookies.username;
    mongoController.connectToDb().then((db) => db.collection("missions").find({
        code: code,
        active: "false"
    }).sort({
        update: 1
    }).toArray().then((res) => {
        //add all missions to missions (array)
        res.forEach(mission => missions.push(mission.fails < mission.numOfFails ? "pass" : mission.fails));

        //
        missionIsActive(code).next((activeMission, missions) => {
            db.collection("games").findOne({
                code: code,
            }).next((res) => {
                if (res == null) {
                    res.redirect("/");
                } else {
                    if (activeMission) {
                        if (missions.activeUsers && missions.activeUsers.includes(username)) {
                            res.render("main", {
                                missions: missions,
                                state: "showOnMission",
                                users: res.users
                            })
                        } else {
                            res.render("main", {
                                missions: missions,
                                state: "showWait"
                            })
                        }
                    } else {
                        getNextMissionCount((missionSize) => res.render("main", {
                            missions: missions,
                            state: "showMission",
                            missionSize: missionSize,
                            users: res.users
                        }));
                    }
                }
            });
        })
    })).catch((err) => {
        verifyController.onMongoDbException(err, res);
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