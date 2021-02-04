var express = require("express");
var router = express.Router();

var lobbyController = require("../controllers/lobby-controller");

var nightController = require("../controllers/night-contoller");

var missionController = require("../controllers/mission-conroller");

router.get("/", lobbyController.loadLanding);
router.post("/create_code", lobbyController.createLobby);
router.post("/", lobbyController.joinLobby);
router.post("/remove_user", lobbyController.removeUser);
router.get("/games", lobbyController.loadLobby);
router.get("/night/started", nightController.hasStarted)
router.get("/night", nightController.loadNight);
router.post("/night", nightController.assignRoles);
router.post("/createMission", missionController.createMission);
router.get("/main", missionController.loadMain);
router.get("/main/state", missionController.getUserState);
router.get("/main/new_mission", missionController.getCurrentMission);
router.post("/main/new_mission", missionController.createMission);
router.post("/vote", missionController.vote);

module.exports = router;