// verify that username and code exist and code is 4 characters long
function verifyCredentials(username, code) {
    if (!username || !code || code.length != 4) {
        return false;
    }
    return true;
}

//when there is a mongodb error
function onMongoDbException(exception, res) {
    console.log(exception);
    if (res)
        res.redirect("/");
}

//verify that something exists and is essential that it does exist
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