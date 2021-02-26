const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");
const goodRoles = ["Good Knight", "Merlin", "Percival"];

function loadMerlin(req, res) {
    // get creds and verify them
    let username = req.cookies.username;
    let code = req.cookies.code;
    if (!verifyController.verifyCredentials(username, code)) {
        res.redirect("/");
        return;
    }

    mongoController.connectToDb().then((db) => db.collection("games").findOne({
        code: code,
    }).then((result) => {
        if (result.winner != null) {
            if (goodRoles.includes(result.users.find(element => element.username == username).role) ^ result.winner == "good")
                res.redirect("/finish/lose");
            else
                res.redirect("/finish/win");
            return;
        }
        res.render("merlin", {
            users: result.users,
            assassin: result.users.find(element => element.username == username).role == "Assassin" ? "true" : "false"
        });
    })).catch((err) => verifyController.onMongoDbException(err, res));
}

function guessMerlin(req, res) {
    let username = req.cookies.username;
    let code = req.cookies.code;
    if (!verifyController.verifyCredentials(username, code)) {
        res.redirect("/");
        return;
    }
    mongoController.connectToDb().then((db) => db.collection("games").findOne({
        code: code,
    }).then((result) => {
        const gameResult = result.users.find(element => element.role == "Merlin").username == req.body.guess ? "bad" : "good";
        db.collection("games").updateOne({
            code: code
        }, {
            $set: {
                winner: gameResult
            }
        }).then(() => {
            res.sendStatus(200);
        });
    })).catch((err) => verifyController.onMongoDbException(err, res));
}

module.exports = {
    loadMerlin,
    guessMerlin
}