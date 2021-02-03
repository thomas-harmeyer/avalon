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
    if (!Array.isArray(suggestedUsers)) {
        suggestedUsers = [suggestedUsers];
    }
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
                        active: "true"
                    },
                    function () {
                        missionActive = true;
                    }
                )

            });
        } else {
            main(req, res);
        }
    }, code);

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

function main(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    missionIsActive(function (activeMission, missions) {
        console.log(activeMission);
        console.log(missions);
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
                                    state: "showOnMission",
                                    users: result.users
                                })
                            } else {
                                res.render("main", {
                                    state: "showWait"
                                })
                            }
                        } else {
                            res.render("main", {
                                state: "showMission",
                                missionSize: 3,
                                users: result.users
                            });
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
        console.log(activeMission);
        console.log(missions);
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
                console.log(result);

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
        });
    });
}

function getAllMissions() {

}


module.exports = {

    createMission,
    getCurrentMission,
    vote,
    main,
    getUserState
};