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

    //for the case where it was just 1 object so it was not an array, make it an array
    if (!Array.isArray(suggestedUsers)) {
        suggestedUsers = [suggestedUsers];
    }

    //this is so terrible and I am going to have to spend so much time fixing it
    getNextMissionCount(code).then((response) => {
        missionIsActive(code).then((obj) => {
            if (obj == null) {
                mongoController.connectToDb().then((db) => {
                    let collection = db.collection('missions');
                    collection.insertOne({
                        updated: Date.now(),
                        code: code,
                        suggester: username,
                        suggestedUsers: suggestedUsers,
                        activeUsers: suggestedUsers,
                        active: "true",
                        numberOfUsers: response.numOfUsers,
                        numOfFails: response.numOfFails
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
    return new Promise(function (resolve, reject) {
        mongoController.connectToDb().then((db) => db.collection("games").findOne({
            code: code,
        }).then((result) => {
            numOfPlayers = result.users.length;
            db.collection("missions").find({
                code: code,
                active: "false"
            }).sort({
                update: 1
            }).toArray().then((result) => {
                missionNumber = result.length;
                if (numOfPlayers - 5 <= 0 || missionNumber <= 0) {
                    console.log("out of bounds");
                    resolve({
                        numOfUsers: 0,
                        numOfFails: 0
                    });
                } else {
                    let numOfUsers = missionPersonCount[numOfPlayers - 5].numOfPlayers[missionNumber];
                    let numOfFails = missionPersonCount[numOfPlayers - 5].numOfFails[missionNumber];
                    resolve({
                        numOfUsers: numOfUsers,
                        numOfFails: numOfFails
                    });
                }
            });
        })).catch((err) => {
            reject(err);
        });
    });

}

function missionIsActive(code) {
    return new Promise((resolve, reject) => mongoController.connectToDb().then((db) => {
        let collection = db.collection('missions');
        collection.findOne({
            code: code,
            active: "true"
        }).then((result) => resolve(result)).catch(err => reject(err));
    }))
}

function loadMain(req, res) {
    var missions = [];
    let code = req.cookies.code;
    let username = req.cookies.username;
    mongoController.connectToDb().then((db) => db.collection("missions").find({
        code: code,
        active: "false"
    }).sort({
        updated: 1
    }).toArray().then((result) => {
        //add all missions to missions (array)
        result.forEach(mission => missions.push(mission.fails < mission.numOfFails ? "pass" : mission.fails));

        //
        missionIsActive(code).then((currentMission) => {
            db.collection("games").findOne({
                code: code,
            }).then((result) => {
                if (result == null) {
                    res.redirect("/");
                } else {
                    if (currentMission) {
                        if (currentMission.activeUsers && currentMission.activeUsers.includes(username)) {
                            res.render("main", {
                                missions: missions,
                                state: "showOnMission",
                                users: result.users
                            })
                        } else {
                            res.render("main", {
                                missions: missions,
                                state: "showWait"
                            })
                        }
                    } else {
                        getNextMissionCount(code).then((missionSize) => res.render("main", {
                            missions: missions,
                            state: "showMission",
                            missionSize: missionSize.numOfUsers,
                            users: result.users
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
    missionIsActive(code).then((activeMission) => {
        mongoController.connectToDb().then((db) => {
            db.collection("games").findOne({
                code: code,
            }).then(result => {
                if (result == null) {
                    res.redirect("/");
                } else {
                    if (activeMission) {
                        if (activeMission.activeUsers && activeMission.activeUsers.includes(username)) {
                            res.send("showOnMission");
                        } else {
                            res.send("showWait");
                        }
                    } else {
                        res.send("showMission");
                    }
                }
            });
        })
    });
}

function vote(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    let failsToAdd = req.body.voteFail != undefined ? 1 : 0;

    mongoController.connectToDb().then((db) => {
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
        }).then(() => {
            checkForInactiveMissions(code).then(() => res.redirect('/main'));
        });
    });

}

function checkForInactiveMissions(code) {
    return new Promise((response, reject) => mongoController.connectToDb().then(db => {
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
        }).then(response());
    }));
}


module.exports = {

    createMission,
    getCurrentMission,
    vote,
    loadMain,
    getUserState
};