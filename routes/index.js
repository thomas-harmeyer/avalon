const express = require("express");
const router = express.Router();

const lobbyController = require("../controllers/lobby-controller");

const nightController = require("../controllers/night-controller");

const missionController = require("../controllers/mission-controller");

const finishController = require("../controllers/finish-controller");

const merlinController = require("../controllers/merlin-controller");

const loginController = require("../controllers/login-controller");

router.get("/login", loginController);
router.get("/", lobbyController.loadLanding);
router.post("/create_code", lobbyController.createLobby);
router.post("/", lobbyController.joinLobby);
router.post("/remove_user", lobbyController.removeUser);
router.get("/games", lobbyController.loadLobby);
router.get("/games/refresh", lobbyController.getNumberOfUsersInLobby);
router.get("/night/started", nightController.hasStarted)
router.get("/night", nightController.loadNight);
router.post("/night", nightController.assignRoles);
router.post("/createMission", missionController.createMission);
router.get("/main", missionController.loadMain);
router.get("/main/state", missionController.getUserState);
router.get("/main/new_mission", missionController.getCurrentMission);
router.post("/main/new_mission", missionController.createMission);
router.post("/vote", missionController.vote);
router.get("/finish/win", finishController.loadWin);
router.get("/finish/lose", finishController.loadLose);
router.get("/merlin", merlinController.loadMerlin);
router.get("/finish", merlinController.loadMerlin);
router.post("/merlin/guess", merlinController.guessMerlin);

module.exports = router;