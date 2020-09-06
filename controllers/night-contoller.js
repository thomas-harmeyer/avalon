var timeController = require("../controllers/time-controller");
var assert = require("assert");
var mongoController = require("../controllers/mongo-controller");

function assignRoles(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    var users;
    mongoController.connectToDb(function (db) {
        db.collection("games").findOne({
                code: code,
            },
            function (err, result) {
                assert.equal(null, err);
                console.log("Found 1 result:", result);
                console.log(typeof result);
                users = result.users;
                let bulkUpdate = [];
                let roles = getRoles(users.length);
                users.forEach((value, key) => {
                    let username = value.username;
                    bulkUpdate.push({
                        "updateOne": {
                            "filter": {
                                "code": code,
                                "users.username": username,
                            },
                            "update": {
                                $set: {
                                    "users.$.role": roles.pop()
                                }
                            }

                        }
                    })
                });
                mongoController.connectToDb((db) => {
                    let collection = db.collection("games");
                    console.log(users);
                    collection.bulkWrite(bulkUpdate, (err, result) => {
                        loadNight(req, res);
                    });
                });
            });
    });
}

function loadNight(req, res) {
    let code = req.cookies.code;
    let username = req.cookies.username;
    mongoController.connectToDb((db) => {
        let collection = db.collection("games");
        collection.findOne({
            "code": code
        }, (err, result) => {
            console.log(result);
            let users = result.users;
            let role;
            let know = [];
            console.log(users);
            users.forEach((value, key) => {
                if (value.username == username);
                role.username = value.username;
                role.role = value.role;
            });
            switch (role.role) {
                case "Merlin":
                    users.forEach((value, key) => {
                        if (value.role == "Assassin" || value.role == "Morgana" ||
                            value.role == "Bad Knight") {
                            let temp = value;
                            temp.role = "Bad";
                            know.push(temp);
                        }
                    });
                    break;
                case "Percival":
                    users.forEach((value, key) => {
                        if (value.role == "Merlin" || value.role == "Morgana") {
                            let temp = value;
                            temp.role = "Bad";
                            know.push(value);
                        }
                    });
                    break;
                case "Good Knight":
                    break
                case "Assassin":
                    users.forEach((value, key) => {
                        if (value.role == "Assassin" || value.role == "Morgana" ||
                            value.role == "Bad Knight") {
                            let temp = value;
                            temp.role = "Bad";
                            know.push(value);
                        }
                    });
                    break;
                case "Morgana":
                    users.forEach((value, key) => {
                        if (value.role == "Assassin" || value.role == "Morgana" ||
                            value.role == "Bad Knight") {
                            let temp = value;
                            temp.role = "Bad";
                            know.push(value);
                        }
                    });
                    break;
                case "Bad Knight":
                    users.forEach((value, key) => {
                        if (value.role == "Assassin" || value.role == "Morgana" ||
                            value.role == "Bad Knight");
                        let temp = value;
                        temp.role = "Bad";
                        know.push(value);
                    });
                    break;

            }
            console.log("know----------", know);
            console.log("role----------", role);
            res.render("night", {
                "role": role,
                "users": know,
            });
        })
    });
}

function getRoles(n) {
    let roles = ["Merlin", "Assassin", "Percival", "Morgana", "Good Knight"];
    for (let i = 5; i < n; i++) {
        roles.push("Good Knight");
        n--;
        if (!i < n)
            break;
        roles.push("Bad Knight");
    }
    for (let i = 0; i < n; i++) {
        let x = getRandomInt(n);
        let y = getRandomInt(n);
        let temp = roles[x];
        roles[x] = roles[y];
        roles[y] = temp;
    }
    return roles;
}

function getRandomInt(max) {
    max++;
    return Math.floor(Math.random() * max);
}
module.exports = {
    assignRoles,
    loadNight
}