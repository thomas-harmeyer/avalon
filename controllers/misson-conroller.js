var mongoController = require("../controllers/mongo-controller");
var assert = require("assert");
function createMission(req, res) {
    let username = req.cookies.username;
    let suggestedUsers = req.body.suggestedUsers;
    mongoController.connectToDb(function (db) {
        let collection = db.collection('games');
        collection.updateOne(
            {
                code:code
            },
            {
                $addToSet: {
                    missions: {
                        suggester: username,
                        suggestedUsers: suggestedUsers
                    }
                }
            }
        )

    });
}
function voteMisson(missonId, vote) {
    
}
function getMission(id) {

}
function getAllMissions() {
    
}


module.exports = {
    createMission,
};
