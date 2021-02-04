function verifyCredentials(username, code) {
    if (!username || !code || code.length != 4) {
        return false;
    }
    return true;
}

function onMongoDbException(exception, res) {
    console.log(exception);
    if (res)
        res.redirect("/");
}

function verifyExists(val, res) {
    if (val) return true;
    else {
        if (res) {
            res.redirect("/");
        }
        return false;
    }
}

module.exports = {
    verifyCredentials,
    onMongoDbException,
    verifyExists,
}