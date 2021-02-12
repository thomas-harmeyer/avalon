function loadWin(req, res) {
    res.render("finish", {
        result: "win"
    });
}

function loadLose(req, res) {
    res.render("finish", {
        result: "lose"
    });
}

module.exports = {
    loadWin,
    loadLose

}