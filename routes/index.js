var express = require("express");
var router = express.Router();

var lobbyController = require("../controllers/lobby-controller");

router.get("/", lobbyController.loadLanding);
router.post("/create_code", lobbyController.createLobby);
router.post("/", lobbyController.joinLobby);
router.post("/remove_user", lobbyController.removeUser);
router.get("/games", lobbyController.loadLobby);

module.exports = router;