var init = false;

// Necessary libs
const discord = require('discord.js');
const Express = require('express');
const msg_req = require('./helpers/msg-helper.js');
const api_req = require('./helpers/api.js');
const con_req = require('./helpers/db.js');
const usr_req = require('./helpers/user.js');
let bodyParser = require('body-parser');

// Initial vars and constants
const bot = new discord.Client();
const app = Express();
let settings = null;
let Msg = new msg_req();
let Api = new api_req();
let Usr = new usr_req();
let Con = new con_req();

Con.toLog(`App started`);

Api.settings.retrieve().then(function (result) {
    settings = result;
    Con.toLog('Attempting Discord login', 'discord_api');
    bot.login(settings['bot_token']);
    app.listen(settings['app_port'], () => {
        Con.toLog(`Express application initialized`, 'express_api');
    });
    Msg.store.size();
    Usr.setSettings = settings;
});

/*
    == Bot functions ==
*/

bot.on("ready", () => {
    Con.toLog('Discord Bot Initialized', 'discord_api');

    if (bot.user.username !== settings['bot_name']) {
        Con.toLog(`bot_name mismatch in settings. Updating.`, 'settings');
        Api.settings.update('bot_name', bot.user.username);
    }

    if (bot.user.id !== settings['bot_id']) {
        Con.toLog(`bot_id mismatch in settings. Updating.`, 'settings');
        Api.settings.update('bot_id', bot.user.id);
    }

    if (settings['bot_activity'] !== '') {
        bot.user.setPresence({
            game: {
                name: settings['bot_activity_name'],
                type: settings['bot_activity'],
                url: settings['bot_activity_url']
            }
        })
    }
});

bot.on("message", message => {
    if (message.guild.id == settings['bot_guild_id']) {
        Msg.store.add(Msg.toObject(message, settings), settings);
    }
});

bot.on("messageDelete", (deletedMessage) => {
    if (deletedMessage.guild.id == settings['bot_guild_id']) {
        Con.toLog('DeleteMessage Invoked. Synchronizing message_store', 'discord_api');
        Msg.store.remove(deletedMessage.id);
    }
});

bot.on("messageUpdate", (oldMessage, newMessage) => {
    if (oldMessage.guild.id == settings['bot_guild_id']) {
        Con.toLog('UpdateMessage Invoked. Synchronizing message_store', 'discord_api');
        Msg.store.alter(oldMessage, newMessage, settings);
    }
});

bot.on("guildCreate", (guild) => {
    Con.toLog(`Bot has joined new guild. Guild name: ${guild.name}`, 'discord_api', 1);
});

bot.on("error", (err) => {
    Con.toLog(err, 'discord_api', 'discord_api_error', 2);
});

bot.on("disconnect", () => {
    Con.toLog(`Bot was disconnected from the Discord API. Attempting reconnect`, 'discord_api_error', 2);
    bot.login(settings['bot_token']);
})

/*
    == Express functions ==
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/status', function(req, res) {
    let statusMessage = {
        "discord": bot.status,
        "express": 200
    }
    res.json(statusMessage);
});

app.get('/api/logs/:action', function (req, res) {
    Con.toLog(`API Call: /api/logs/${req.params.action}`, 'express_api');
    let ret;
    switch(req.params.action.toLocaleLowerCase()) {
        case "show":
            if (req.params.limit !== undefined && req.params.category !== undefined && req.params.severity !== undefined) {
                Con.fromLog(Number(req.params.limit), req.params.category, req.params.severity).then((resp) => {
                    res.json(resp);
                });;
            } else if (req.params.limit !== undefined && req.params.category !== undefined) {
                Con.fromLog(Number(req.params.limit), req.params.category).then((resp) => {
                    res.json(resp);
                });;
            }  else if (req.params.limit !== undefined && req.params.severity !== undefined) {
                Con.fromLog(Number(req.params.limit), null, req.params.severity).then((resp) => {
                    res.json(resp);
                });;
            }  else if (req.params.category !== undefined && req.params.severity !== undefined) {
                Con.fromLog(100, req.params.category, req.params.severity).then((resp) => {
                    res.json(resp);
                });;
            }  else if (req.params.limit !== undefined) {
                Con.fromLog(Number(req.params.limit)).then((resp) => {
                    res.json(resp);
                });;
            }  else if (req.params.category !== undefined) {
                Con.fromLog(100, req.params.category).then((resp) => {
                    res.json(resp);
                });;
            }  else if (req.params.severity !== undefined) {
                Con.fromLog(100, null, req.params.severity).then((resp) => {
                    res.json(resp);
                });;
            } else {
                Con.fromLog().then((resp) => {
                    res.json(resp);
                });
            }
            break;
        default:
            res.status(400).send('Malformed request');
    }
});

app.get('/api/guild/:action', function (req, res) {
    Con.toLog(`API Call: /api/guild/${req.params.action}`, 'express_api');
    switch (req.params.action.toLocaleLowerCase()) {
        case "members":
            let guildMemberCount = bot.guilds.find(guild => guild.id, settings['bot_guild_id']).memberCount;
            res.json({members: guildMemberCount});
            break;
        default:
            res.status(400).send('Malformed request');
    }
});

app.post('/api/user/:action', function (req, res) {
    Con.toLog(`API Call: /api/user/${req.params.action}`, 'express_api');
    let secret, reason;
    let hasmanage = Api.djs.permissions.check(bot, settings['bot_guild_id'], 'MANAGE_ROLES')
    let haskick = Api.djs.permissions.check(bot, settings['bot_guild_id'], 'MANAGE_ROLES')
    let hasban = Api.djs.permissions.check(bot, settings['bot_guild_id'], 'MANAGE_ROLES')
    if (req.body.secret === undefined) {
        secret = null;
        // Api.respond.send(res, 498, 'Invalid secret');
    } else {
        secret = req.body.secret;
    }
    if (req.body.reason === undefined) {
        reason = null;
        // Api.respond.send(res, 498, 'Invalid secret');
    } else {
        reason = req.body.reason;
    }

    switch (req.params.action.toLocaleLowerCase()) {
        case "find":
        case "0":
            if (req.body.user_name !== undefined) {
                Usr.find(bot, req.body.user_name).then((result) => {
                    if (result !== false) {
                        res.json(result);
                    } else {
                        Api.respond.send(res, 404, 'User not found');
                    }
                });
            }
            break;
        case "show":
        case "1":
            if (req.body.user_id !== undefined) {
                Usr.show(bot, req.body.user_id).then((result) => {
                    if (result) {
                        res.json(result);
                    } else {
                        Api.respond.send(res, 404, 'User not found');
                    }
                });
            }
            break
        case "verify":
        case "2":
            if (req.body.user_id !== undefined && secret !== null && hasmanage) {
                Usr.verify(bot, req.body.user_id);
                Api.respond.send(res, 200, 'Verify request sent');
            }
            break;
        case "invalidate":
        case "3":
            if (req.body.user_id !== undefined && secret !== null && hasmanage) {
                Usr.invalidate(bot, req.body.user_id);
                Api.respond.send(res, 200, 'Invalidate request sent');
            }
            break;
        case "kick":
        case "4":
            if (req.body.user_id !== undefined && secret !== null && haskick) {
                Usr.kick(bot, req.body.user_id, reason);
                Api.respond.send(res, 200, 'Kick request sent');
            }
            break;
        case "ban":
        case "5":
            if (req.body.user_id !== undefined && secret !== null && hasban) {
                Usr.ban(bot, req.body.user_id, reason);
                Api.respond.send(res, 200, 'Ban request sent');
            }
            break;
        default:
            res.status(400).send('Malformed request');
    }
});

app.get('/api/messages/:action', function (req, res) {
    Con.toLog(`API Call: /api/messages/${req.params.action}`, 'express_api');
    let limit, type;
    if (req.query.limit !== undefined) {
        limit = req.query.limit;
    } else {
        limit = 100;
    }

    if (req.query.type !== undefined) {
        if (req.query.type == 'xml') {
            type = 'xml';
        } else {
            type = 'json';
        }
    } else {
        type = 'json';
    }

    switch (req.params.action.toLocaleLowerCase()) {
        case "show":
        case "0":
            Msg.store.retrieve(limit).then((result) => {
                Api.respond.objectFormat(res, result, type);
            });
            break;
        case "channel":
        case "1":
            Msg.store.retrieve(limit, req.query.channel_id, null).then((result) => {
                Api.respond.objectFormat(res, result, type);
            });
            break;
        case "user":
        case "2":
            Msg.store.retrieve(limit, null, user=req.query.user_id).then((result) => {
                Api.respond.objectFormat(res, result, type);
            });
            break;
        case "full":
        case "3":
            Msg.store.retrieve(limit, req.query.channel_id, req.query.user_id).then((result) => {
                Api.respond.objectFormat(res, result, type);
            });
            break;
        case "flush":
        case "4":
            Api.secret.verify(req.query.secret).then((result) => {
                if (result) {
                    Api.respond.send(res, 200, `Verified: ${Msg.store.flush()}`);
                } else {
                    Api.respond.send(res, 401, 'Secret could not be validated');
                }
            });
            break;
        default:
            Api.respond.send(res, 400, 'Malformed Request');
    }
});

app.post('/api/secret/:action', function (req, res) {
    Con.toLog(`API Call: /api/secret/${req.params.action}`, 'express_api');
    let secret, token;
    if (req.body.secret !== undefined) {
        secret = req.body.secret;
    }
    if (req.body.token !== undefined) {
        token = req.body.token;
    }

    switch (req.params.action.toLocaleLowerCase()) {
        case "verify":
        case "0":
            if (secret === undefined || secret === null) {
                res.status(400).send('secret not defined or empty');
            } else {
                Api.secret.verify(secret).then((response) => {
                    if (response) {
                        res.json({'result': 200});
                    } else {
                        res.json({'result': 401});
                    }
                });
            }
            break;
        case "create":
        case "1":
            if (token !== undefined || token !== null) {
                desc = '';
                if (req.body.description !== undefined || req.body.description !== null) {
                    desc = req.body.description;
                }
                new_secret = Api.secret.create(token, desc, settings);
                if (new_secret === false) {
                    Api.respond.send(res, 500);
                } else {
                    res.json(new_secret);
                }
            } else {
                Api.respond.send(res, 400, 'Token not defined or empty');
            }
            break;
        case "remove":
        case "2":
            Api.secret.remove(res, secret, req.body.confirm);
            break;
        default:
            Api.respond.send(res, 400, 'Malformed request');
    }
});