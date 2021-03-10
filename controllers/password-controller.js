//encodes ascii into base64 so it is hard to read and stuff
function encode(password) {
    const buffer = Buffer.from(password, "ascii");
    return buffer.toString("base64");
}

//decodes passwords, but like prolly dont use this yk
function decode(password64) {
    const buffer = Buffer.from(password64, "base64");
    return buffer.toString("ascii");
}

module.exports = {
    encode,
    decode
}