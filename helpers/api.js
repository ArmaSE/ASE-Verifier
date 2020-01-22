class main {
    constructor() {
        this.respond = new respond();
        this.secret = new secret();
        this.settings = new settings();
        this.djs = new djs();
    }

}

class djs {
    constructor() {
        this.permissions = new permissions();
    }
}

class permissions {
    constructor() {}

    check(bot, guildid, permissionResolvable) {
        let sql = this.sql;
        let guildObject = bot.guilds.find(guild => guild.id, guildid);
        let permCheck = guildObject.me.hasPermission(permissionResolvable);

        if (permCheck) {
            sql.toLog(`Account has permission: ${permissionResolvable}`, 'discord_api_permission');
            return true;
        } else {
            sql.toLog(`Account lacks permission: ${permissionResolvable}`, 'discord_api_permission');
            return false;
        }
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }
}

class respond {
    constructor() {}

    send(response, status=200, message='') {
        response.status(status).send(message);
    }

    objectFormat(response, result, type='json') {
        let xml = this.xml;
        let sql = this.sql;
        if (type == 'json') {
            sql.toLog(`Responding with messages as JSON object`, 'message_store');
            response.json(result);
        } else {
            sql.toLog(`Responding with messages as XML object`, 'message_store');
            response.type('application/xml');
            response.send(xml.buildObject(result));
        }
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }

    get xml() {
        let xml = require('xml2js');
        return new xml.Builder();
    }
}

class secret {
    constructor() {}

    verify(scrt) {
        let sql = this.sql;
        let db = sql.connect();
        let newrows = [];
        if (scrt != null || scrt != undefined) {
            return new Promise(function (resolve, reject) {
                let query = 'SELECT key FROM app_keys;';

                sql.toLog(`Beginning secret verification`, 'express_api');
                db.all(query, [], function (err, rows) {
                    if (err) {
                        sql.toLog('Could not access app_keys table in db', 'express_api_error', 2);
                        return false;
                    }

                    rows.forEach((row) => {
                        newrows.push(row.key);
                    });

                    db.close()
                    newrows.forEach((row) => {
                        if (row === scrt) {
                            sql.toLog(`Secret verified successfully`, 'express_api');
                            resolve(true);
                        }

                        resolve(false);
                    });
                });
            });
        }
    }

    create(token, description, settings) {
        if (token !== settings['bot_token']) {
            return false;
        }
        
        let sql = this.sql;
        let db = sql.connect();
        let hat = require('hat');
    
        let secret = hat();
    
        if (token != null || token != undefined) {
            let query = `INSERT INTO app_keys (key, description) VALUES ('${secret}', '${description}');`;
    
            sql.toLog(`Beginnig secret creation`, 'express_api');
            db.run(query, [], function (err) {
                if (err) {
                    sql.toLog('Could not add new secret to app_keys table in db', 'express_api_error', 2);
                    return false;
                }
    
                sql.toLog(`New secret generated successfully`, 'express_api');
                db.close()
            });
            return {'secret': secret, 'description': description};
        } else {
            return false;
        }
    }

    remove(res, secret, confirm) {
        let resp = new respond();
        let msghelper = this.msghelper;
        let sql = this.sql;
        if (confirm !== undefined) {
            sql.toLog(`Attempting to delete secret ${secret}`);
            let db = sql.connect();

            let query = `DELETE FROM app_keys WHERE key = '${secret}'`;

            db.run(query, [], function (err) {
                if (err) {
                    sql.toLog(`Could not delete secret ${secret}`, 'express_api_alert', 1);
                    return false;
                }

                msghelper.store.size().then((res) => {
                    sql.toLog(`Deleted secret '${secret}' from message_store.`, 'express_api');
                });
                db.close();
                resp.send(res, 200, 'Secret removed');
            });
        } else {
            resp.send(res, 400, 'Missing confirmation variable');
        }
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }

    get msghelper() {
        let msghelp = require('./msg-helper.js');
        return new msghelp();
    }
}

class settings {
    constructor() {}

    update(setting, value) {
        let sql = this.sql;
        let db = sql.connect();
        let query = `UPDATE settings SET value = '${value}' WHERE setting = '${setting}';`;
    
        if (setting !== null && value !== null) {
            db.run(query, [], (err) => {
                if (err) {
                    console.log(err);
                }
                db.close();
                sql.toLog(`Successfully updated ${setting} in settings. New value = ${value}`, 'settings_alert', 1);
                return true;
            });
        } else {
            return false;
        }
    }

    retrieve() {
        let sql = this.sql;
        let db = sql.connect();
        sql.toLog(`Setting retrieval requested`, `settings`);
        let settings = {};
        let query = 'SELECT setting setting, value value FROM settings ORDER BY setting;';
    
        return new Promise(function (resolve, reject) {
            db.all(query, (err, rows) => {
                if (err) {
                    sql.toLog('Could not retrieve settings', 'settings_error', 2);
                    this.sleep(500).then(() => {
                        process.exit(0);
                    });
                }
    
                rows.forEach((row) => {
                    settings[row.setting] = row.value;
                });
    
                db.close();
                sql.toLog(`Settings retrieved successfully`, `settings`);
                resolve(settings);
            });
        });
    }

    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }

    get msghelper() {
        let msghelp = require('./msg-helper.js');
        return new msghelp();
    }
}

module.exports = main;