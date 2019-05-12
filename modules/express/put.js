exports.verifySecret = (secret) => {
    let keys = require('../../json/keys.json').list;
    let accept = false;

    keys.forEach((key) => {
        if (key == secret) {
            accept = true;
        }
    });

    if (!accept) {
        return false;
    } else {
        return true;
    }
}