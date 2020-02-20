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
        
            if (message.attachments !== undefined && message.attachments !== "") {
                contentObject.attachments = [];
                message.attachments.forEach((attachment) => {
                    contentObject.attachments.push(attachment.proxyURL);
                });
            } else if (message.embeds.length > 0) {
                contentObject.attachments = ['embed'];
            } else {
                contentObject.attachments = [''];
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

    sendMessage(bot, message, channel_id) {
        let sql = this.sql;

        try {
            bot.channels.get(channel_id).send(message);
            sql.toLog(`sendMessage complete. Message: ${message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendMessage request could not be completed', 'discord_api_messagea', 1);
            return false;
        }
    }

    sendError(bot, err_message, channel_id) {
        let sql = this.sql;
        let color = 13832208;

        let embed_ct = {
            color: color,
            title: "The bot has encountered an error",
            description: err_message,
            timestamp: new Date(),
            footer: {
                icon_url: bot.user.avatarURL,
                text: "För mer info, besök asev.obliv1on.com"
            }
        }

        try {
            bot.channels.get(channel_id).send({embed: embed_ct});
            sql.toLog(`sendError complete. Message: ${err_message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendError request could not be completed', 'discord_api_messagea', 1);
            return false;
        }
    }

    sendAlert(bot, message, extra_text, channel_id, image=null) {
        let sql = this.sql;
        let color = 15888410;

        let embed_ct = null

        if (image == null) {
            embed_ct = {
                color: color,
                title: message,
                description: extra_text,
                timestamp: new Date(),
                footer: {
                    icon_url: bot.user.avatarURL,
                    text: "För mer info, besök asev.obliv1on.com"
                }
            }
        } else {
            embed_ct = {
                color: color,
                title: message,
                description: extra_text,
                timestamp: new Date(),
                footer: {
                    icon_url: bot.user.avatarURL,
                    text: "För mer info, besök asev.obliv1on.com"
                },
                thumbnail: {
                    url: image
                }
            }
        }

        try {
            bot.channels.get(channel_id).send({embed: embed_ct});
            sql.toLog(`sendAlert complete. Message: ${message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendAlert request could not be completed', 'discord_api_messages', 1);
            return false;
        }
    }

    sendEmbedMessage(bot, message, channel_id) {
        let sql = this.sql;
        let color = 27812;

        let embed_ct = {
            color: color,
            description: message,
            timestamp: new Date()
        }

        try {
            bot.channels.get(channel_id).send({embed: embed_ct});
            sql.toLog(`sendEmbedMessage complete. Message: ${message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendEmbedMessage request could not be completed', 'discord_api_messagea', 1);
            return false;
        }
    }

    sendGameAnnouncement(bot, message, channel_id) {
        let sql = this.sql;
        let color = 12841498;

        let embed_ct = {
            color: color,
            author: {
                name: message.author.name,
                icon_url: message.author.icon
            },
            title: message.title,
            url: message.url,
            description: "Nytt spel har reserverats!",
            fields: [
                {
                    name: "Datum",
                    value: message.game.time
                },
                {
                    name: "Terräng",
                    value: message.game.terrain
                },
                {
                    name: "Kort beskrvning",
                    value: message.game.description
                }
            ],
            timestamp: new Date(),
            footer: {
                icon_url: bot.user.avatarURL,
                text: "För mer info, gå in på armasweden.se"
            }
        }

        try {
            bot.channels.get(channel_id).send({embed: embed_ct});
            sql.toLog(`sendGameAnnouncement complete. Message: ${message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendGameAnnouncement request could not be completed', 'discord_api_messagea', 1);
            return false;
        }
    }

    sendResponse(bot, message, channel_id) {
        let sql = this.sql;
        let color = 4095;

        let embed_ct = {
            color: color,
            description: message,
            timestamp: new Date()
        }

        try {
            bot.channels.get(channel_id).send({embed: embed_ct});
            sql.toLog(`sendResponse complete. Message: ${message}`, 'discord_api_messages');
            return true;
        } catch (e) {
            sql.toLog(e, 'error', 2);
            sql.toLog('sendResponse request could not be completed', 'discord_api_messagea', 1);
            return false;
        }
    }

    // sendCustomEmbed(bot, message, hex, channel_id) {
    //     let sql = this.sql;

    //     let embed = {
    //         color: hex,
    //         author: {
    //             name: bot.user.username,
    //             icon_url: bot.user.avatarURL
    //         },
    //         title: "This is an embed",
    //         url: "http://google.com",
    //         description: "This is a test embed to showcase what they look like and what they can do.",
    //         fields: [
    //             {
    //                 name: "Fields",
    //                 value: "They can have different fields with small headlines."
    //             },
    //             {
    //                 name: "Masked links",
    //                 value: "You can put [masked links](http://google.com) inside of rich embeds."
    //             },
    //             {
    //                 name: "Markdown",
    //                 value: "You can put all the *usual* **__Markdown__** inside of them."
    //             }
    //         ],
    //         timestamp: new Date(),
    //         footer: {
    //         icon_url: bot.user.avatarURL,
    //         text: "© Example"
    //         }
    //     }

    //     try {
    //         bot.channels.get(channel_id).send(message);
    //         sql.toLog(`sendEmbed complete. Message: ${message}`, 'discord_api_messages');
    //         return true;
    //     } catch (e) {
    //         sql.toLog(e, 'error', 2);
    //         sql.toLog('sendEmbed request could not be completed', 'discord_api_messagea', 1);
    //         return false;
    //     }
    // }

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