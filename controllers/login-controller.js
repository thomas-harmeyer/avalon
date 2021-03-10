const mongoController = require("./mongo-controller");
const verifyController = require("./verify-controller");
const passwordController = require("./password-controller");
const goodRoles = ["Good Knight", "Merlin", "Percival"];

function loadLogin(req, res) {
    if (req.query.error) {
        const error = req.query.error;
        res.render("login", {
            error: error
        });
    } else {
        res.render("login", {});
    }
}

function loadRegister(req, res) {
    res.render("register", {});
}

//given a username and password it will either give you cookies and redirect you to the lobby or refresh page and show error
function login(req, res) {
    const username = req.body.username;
    const passwordAscii = req.body.password;
    const password64 = passwordController.encode(passwordAscii);
    mongoController.connectToDb().then((db) => {
        db.collection("users").findOne({
            username: username,
            password: password64,
        }).then((user) => {
            if (user) {
                res.cookie("username", username);
                res.cookie("password", password64);
                res.redirect("/");
            } else {
                res.redirect("login?error=We could not find anyone with those credentials.");
            }
        })
    })
}

//given a username and password, this will insert you into the game and then ask you to login again
function register(req, res) {
    const username = req.body.username;
    const passwordAscii = req.body.password;
    const password64 = passwordController.encode(passwordAscii);
    mongoController.connectToDb().then((db) => {
        db.collection("users").findOne({
            username: username,
            password: password64,
        }).then((result) => {
            if (result == null) {
                db.collection("users").insertOne({
                    username: username,
                    password: password64
                }).then((result) => {
                    res.redirect(
                        "login?error=thank you for registering, please login now."
                    )
                })
            } else {
                res.redirect(
                    "login?error=That user already exists please try logging in."
                )
            }
        });

    });
}

module.exports = {
    loadLogin,
    login,
    loadRegister,
    register
}