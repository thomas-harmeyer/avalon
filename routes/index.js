var express = require("express");
var router = express.Router();

var lobbyController = require("../controllers/lobby-controller");

var nightController = require("../controllers/night-contoller");

router.get("/", lobbyController.loadLanding);
router.post("/create_code", lobbyController.createLobby);
router.post("/", lobbyController.joinLobby);
router.post("/remove_user", lobbyController.removeUser);
router.get("/games", lobbyController.loadLobby);
router.get("/night", nightController.loadNight);
router.post("/night", nightController.assignRoles);

module.exports = router;