const secConst = 1000;
const minConst = secConst * 60;
const hourConst = minConst * 60;

function sec(seconds) {
    return seconds * secConst;
}

function min(mins) {
    return mins * minConst;
}

function hour(hours) {
    return hours * hourConst;
}

module.exports = {
    sec,
    min,
    hour
}