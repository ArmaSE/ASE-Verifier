class msgHelper {
    constructor() {
        this.discord = new discord();
        this.store = new store();
    }

    toObject(message, settings) {
        // authorObject = id, name, avatarURL
        // contentObject = time, url, string, attachments
        if (message.guild.id == settings['bot_guild_id']) {
            let authorObject = {
                id: message.author.id,
                name: message.author.tag,
                avatarURL: message.author.avatarURL
            }
            let contentObject = {
                guild: {
                    id: message.guild.id,
                    name: message.guild.name
                },
                channel: {
                    id: message.channel.id,
                    name: message.channel.name
                },
                time: message.createdTimestamp,
                url: message.url,
                id: message.id,
                string: message.content
            }
        
            if (message.attachments != undefined) {
                contentObject.attachments = [];
                message.attachments.forEach((attachment) => {
                    contentObject.attachments.push(attachment.proxyURL);
                });
            } else {
                contentObject.attachments = ['']
            }
    
            let convertedMessage = {};
            convertedMessage.author = authorObject;
            convertedMessage.content = contentObject;
    
            return convertedMessage;
        } else {
            return;
        }
    }
}

class discord {
    constructor() {}

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }
}

class store {
    constructor() {}

    size() {
        let sql = this.sql;
        let db = sql.connect()
        let count = 0;
        let query = 'SELECT COUNT(*) as messages FROM message_store;';
        return new Promise(function (resolve, reject) {
            db.all(query, function (err, rows) {
                if (err) {
                    sql.toLog('Could not retrieve message_store size', 'message_store_error', 2);
                    sleep(500).then(() => {
                        process.exit(0);
                    });
                }
                count = Number(rows[0].messages);
                sql.toLog('Checked message_store size. Reported: ' + count + ' messages', 'message_store');
                db.close();
    
                resolve(count);
            });
        });
    }

    add(msg, settings) {
        let sql = this.sql;
        let msghelper = new msgHelper();
        let db = sql.connect();

        if (msg !== null) {
            let query = `INSERT INTO message_store (
                message_id,
                author_id,
                author_name,
                author_avatar,
                guild_id,
                guild_name,
                channel_id,
                channel_name,
                time,
                message_url,
                message_content,
                message_attachments
            ) VALUES (
                '${msg.content.id}',
                '${msg.author.id}',
                '${msg.author.name}',
                '${msg.author.avatarURL}',
                '${msg.content.guild.id}',
                '${msg.content.guild.name}',
                '${msg.content.channel.id}',
                '${msg.content.channel.name}',
                '${msg.content.time}',
                '${msg.content.url}',
                '${msg.content.string}',
                '${msg.content.attachments}'
            );`;

            db.run(query, [], function (err) {
                if (err) {
                    console.log(err);
                    return false;
                } else {
                    msghelper.store.size().then(function (result) {
                        sql.toLog(`Message added to store`, 'message_store');
                        if (result > parseInt(settings['app_store_amount'])) {
                            sql.toLog(`message_store overflowing. Removing excess.`, 'message_store_alert', 1);
                            let tot = result - parseInt(settings['app_store_amount']);
                            msghelper.store.truncate(tot);
                        }
                        db.close();
                        return true;
                    });
                }
            });
        }
    }

    alter(oldMsg, newMsg, settings) {
        let sql = this.sql;
        let temp = new msgHelper();
        let newmsg = temp.toObject(newMsg, settings);
        let db = sql.connect();
        let query = `UPDATE message_store SET message_content = '${newmsg.content.string}', message_attachments = '${newmsg.content.attachments}' WHERE message_id = '${oldMsg.id}';`;
    
        db.run(query, [], (err) => {
            if (err) {
                sql.toLog(`Could not update message with id '${oldMsg.id}' in message_store`, 'message_store_alert', 1);
                return false;
            }
            db.close();
            sql.toLog(`Successfully updated message with id ${oldMsg.id} in message_store`, 'message_store');
            return true;
        });
    }

    remove(msgID) {
        let sql = this.sql;
        let db = sql.connect();
        let msghelper = new msgHelper();

        let query = `DELETE FROM message_store WHERE message_id = '${msgID}'`;
    
        db.run(query, [], function (err) {
            if (err) {
                sql.toLog(`Could not delete message with id ${msgID}`, 'message_store_alert', 1);
                return false;
            }
    
            msghelper.store.size().then((res) => {
                sql.toLog(`Deleted message with id '${msgID}' from message_store. New message_store size: ${res}`, 'message_store');
            });
            db.close();
            return true;
        });
    }

    retrieve(amount=100, channel=null, user=null) {
        let sql = this.sql;
        sql.toLog(`Attempting to retrieve a maximum of ${amount} messages from message_store`, 'message_store');
        let db = sql.connect();
        let query;
    
        if (channel !== null && user !== null) {
            // Limit search by channel, user and message amount
            sql.toLog(`Limiting search by channel: ${channel} and user: ${user}`, 'message_store');
            query = `SELECT * FROM message_store WHERE channel_id = '${channel}' AND author_id = '${user}' ORDER BY time DESC LIMIT ${amount};`;
        } else if (channel !== null) {
            // Limit search by channel and message amount
            sql.toLog(`Limiting search by channel: ${channel}`, 'message_store');
            query = `SELECT * FROM message_store WHERE channel_id = '${channel}' ORDER BY time DESC LIMIT ${amount};`;
        } else if (user !== null) {
            // Limit search by user and message amount
            sql.toLog(`Limiting search by user: ${user}`, 'message_store');
            query = `SELECT * FROM message_store WHERE author_id = '${user}' ORDER BY time DESC LIMIT ${amount};`;
        } else {
            // Limit only by message amount
            query = `SELECT * FROM message_store ORDER BY time DESC LIMIT ${amount};`;
        }
        return new Promise(function(resolve, reject) {
            db.all(query, [], function (err, rows) {
                if (err) {
                    sql.toLog(`Retrieval of messages failed`, 'message_store_alert', 1);
                    reject(null);
                }

                let messagelist = {};
                let counter = 0;

                rows.forEach((row) => {
                    let authorObject = {
                        id: row['author_id'],
                        name: row['author_name'],
                        avatarURL: row['author_avatar']
                    }
                    let contentObject = {
                        guild: {
                            id: row['guild_id'],
                            name: row['guild_name']
                        },
                        channel: {
                            id: row['channel_id'],
                            name: row['channel_name']
                        },
                        time: row['time'],
                        url: row['message_url'],
                        id: row['message_id'],
                        string: row['message_content'],
                        attachments: row['message_attachments']
                    }

                    let convertedMessage = {};
                    convertedMessage.author = authorObject;
                    convertedMessage.content = contentObject;

                    messagelist[`ID${convertedMessage.content.id}`] = convertedMessage;
                    counter++;
                });

                sql.toLog(`Managed to retrieve ${counter} messages from message_store`, 'message_store');
                resolve(messagelist);
            });
        });
    }

    truncate(count) {
        let sql = this.sql;
        let msghelper = new msgHelper();
        let db = sql.connect();

        let query = `DELETE FROM message_store 
            WHERE message_id IN (
                SELECT message_id 
                FROM message_store 
                ORDER BY time ASC LIMIT ${count}
        );`;
    
        db.run(query, [], function (err) {
            if (err) {
                sql.toLog(`message_store truncation failed`, 'message_store_alert', 1);
                return false;
            } else {
                msghelper.store.size().then((res) => {
                    sql.toLog(`${count} messages removed from store. Current message_store size = ${res}`, 'message_store');
                })
                db.close();
                return true;
            }
        });
    }

    flush() {
        let sql = this.sql;
        sql.toLog(`Attempting to flush message_store`, 'message_store');
        let db = sql.connect();
    
        let query = `DELETE FROM message_store`;
    
        db.run(query, [], function (err) {
            if (err) {
                sql.toLog(`message_store flush unsuccessful`, 'message_store_alert', 1);
                return false;
            } else {
                sql.toLog(`message_store flush successful`, 'message_store');
                return true;
            }
        });
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }
}

module.exports = msgHelper;