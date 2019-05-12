// File for POST funtions of Express
exports.generateSecret = () => {
    let fs = require('fs');
    let hat = require('hat');
    let secret = hat();
    let keysFile = require('../../json/keys.json');

    keysFile.list.push(secret);
    fs.writeFile('.//json/keys.json', JSON.stringify(keysFile, null, 4), (err) => { if (err) console.error(err) });

    console.log(`\n> Generated new secret: ${secret}`);
    return secret;
}