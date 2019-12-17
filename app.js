const startTime = new Date().getTime();
const auditFile = startTime;

// Necessary files/libs
const Discord = require('discord.js');
const Express = require('express');
const xml = require('xml2js');
const fs = require('fs');
const sql = require('sqlite3').verbose();
const conf = require('./json/conf.json');
const messageStore = require('./helpers/messageStore.js');

var initialized = false;
var db = new sql.Database('main.db');
const bot = new Discord.Client();
const app = Express();
const builder = new xml.Builder();
const expressPort = conf.port;

let expressModules = {
    GET: "./modules/express/get.js",
    PUT: "./modules/express/put.js",
    POST: "./modules/express/post.js"
}

// On successful connection to Discord
bot.on("ready", () => {
    init();
});

// Initialize the bot.
function init() {
    if (initialized) return;

    conf.botName = bot.user.username;
    conf.botID = bot.user.id;
    bot.user.setActivity(conf.activity, { type: "PLAYING" });

    let initLog = `== Discord ==\n> Successfully connected to Discord (${new Date().getTime() - startTime} ms)!\n> Name of bot: ${bot.user.username}\n> Current activity: ${conf.activity}\n> Bot ID: ${conf.botID}\n> Prefix: ${conf.prefix}\n> Enable guild command cogs: ${conf.enableResponses}\n> Enable reading Express modules: ${conf.readExpressModules}\n> Developer mode: ${conf.indev}\n== EndInit ==`;
    appendAudit(auditFile, initLog);
    initialized = true;
    fs.writeFile('./json/conf.json', JSON.stringify(conf, null, 4), (err) => { if (err) console.error(err) });

    fs.readFile('./json/store/messages.json', (err, data) => {
        if (err) {
            fs.writeFile('./json/store/messages.json', JSON.stringify({}, null, 4), (err) => { if (err) console.error(err) });
        }

        if (data == '') {
            fs.writeFile('./json/store/messages.json', JSON.stringify({}, null, 4), (err) => { if (err) console.error(err) });
        }
    })
}

// 
// Discord stuff
// 

// Funtion to read in the dynamic cogs ('modules' folder), except for modules in "modules/express"
// Made to be able to update the modules without restarting the bot.
fs.readdir("./modules/", (err, files) => {
    if (conf.enableResponses == false) return; // Ignore rest if this variable is set to false in the config

    if (err) return console.error(err);
    files.forEach(file => {
        let evtFunction = require(`./modules/${file}`);
        let evtName = file.split(".")[0];
        bot.on(evtName, (...args) => evtFunction.run(bot, ...args));
    });
});

// On new message seen by bot
bot.on("message", msg => {
    // Stores message if the ID of the channel corresponds to the ID saved in conf.json
    if (msg.guild.id == conf.getMessagesFrom) {
        convertedMessage = messageStore.convertMessage(msg);

        if (!fs.existsSync(`./json/store/${msg.channel.id}.json`)) {
            fs.writeFileSync(`./json/store/${msg.channel.id}.json`, JSON.stringify({}, null, 4), (err) => { if (err) console.error(err) });
        }

        storeMessage(convertedMessage);
        storeChannelMessage(convertedMessage, msg.channel.id);
    }

    // Trim content, ignore if author is bot, and only continue if prefix is present
    const message = msg.content.trim();
    if (msg.author.bot) return;
    if (!msg.content.startsWith(conf.prefix)) return;

    // Split the whole message per word into argument array, and initial command variable
    let args = msg.content.split(" ").slice(1);
    const command = message.split(/[ \n]/)[0].substring(conf.prefix.length).toLowerCase().trim();

    try {
        if (conf.enableResponses) {
            // If command corresponds to cog with the same name, continue and pass message info and arguments to the cog
            let cmdFile = require(`./modules/${command}.js`);
            cmdFile.run(bot, msg, args, conf);
        }
    } catch (e) {
        // Module not found, send error message in channel, and log the error in the console
        console.error(e);
        msg.channel.sendMessage("", {
            embed: {
                color: 16711680,
                author: {
                    name: bot.user.username,
                    icon_url: bot.user.avatarURL,
                },
                title: `Error: Module not found`,
                description: `Module ${command} does not exist. type **"${conf.prefix}list modules"** to see all available modules.`,
                timestamp: new Date(),
                footer: {
                    icon_url: msg.author.avatarURL,
                    text: `${msg.author.username}`
                }
            }
        });
    }
});

bot.on("messageDelete", (deletedMessage) => {
    let idString = `ID${deletedMessage.id}`;
    appendAudit(auditFile, `> messageDelete invoked. ID = ${idString}`);
    let messages = require('./json/store/messages.json');
    let messageList = Object.keys(messages);

    messageList.forEach((id) => {
        if (id == idString) {
            appendAudit(auditFile, `> Message (ID: ${deletedMessage.id}) was deleted, removing from messageStore.`)
            messages[id] = undefined;
            fs.writeFile('./json/store/messages.json', JSON.stringify(messages, null, 4), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            return;
        }
    });

    let channelStore = require(`./json/store/${deletedMessage.channel.id}.json`);
    let channelMessageList = Object.keys(channelStore);

    channelMessageList.forEach((id) => {
        if (id == idString) {
            appendAudit(auditFile, `> Message (ID: ${deletedMessage.id}) was deleted, removing from channelStore (ID: ${deletedMessage.channel.id}).`);
            channelStore[id] = undefined;
            fs.writeFile(`./json/store/${deletedMessage.channel.id}.json`, JSON.stringify(channelStore, null, 4), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            return;
        }
    });
    // END
    delete require.cache[require.resolve(`./json/store/messages.json`)];
    delete require.cache[require.resolve(`./json/store/${deletedMessage.channel.id}.json`)];
});

bot.on("messageUpdate", (oldMessage, newMessage) => {
    let idString = `ID${oldMessage.id}`;
    appendAudit(auditFile, `> editMessage invoked. ID = ${idString}`);
    let messages = require('./json/store/messages.json');
    let messageList = Object.keys(messages);

    messageList.forEach((id) => {
        if (id == idString) {
            appendAudit(auditFile, `> Message (ID: ${oldMessage.id}) was edited, updating messageStore.`)
            appendAudit(auditFile, `      -> Old Content: ${oldMessage.content}`)
            appendAudit(auditFile, `      -> New Content: ${newMessage.content}`)
            messages[id] = messageStore.convertMessage(newMessage);
            fs.writeFile('./json/store/messages.json', JSON.stringify(messages, null, 4), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            return;
        }
    });

    let channelStore = require(`./json/store/${oldMessage.channel.id}.json`);
    let channelMessageList = Object.keys(channelStore);

    channelMessageList.forEach((id) => {
        if (id == idString) {
            appendAudit(auditFile, `> Message (ID: ${oldMessage.id}) was edited, updating channelStore (ID: ${oldMessage.channel.id}).`)
            appendAudit(auditFile, `      -> Old Content: ${oldMessage.content}`)
            appendAudit(auditFile, `      -> New Content: ${newMessage.content}`)
            channelStore[id] = messageStore.convertMessage(newMessage);
            fs.writeFile(`./json/store/${oldMessage.channel.id}.json`, JSON.stringify(messages, null, 4), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            return;
        }
    });
    // END
    delete require.cache[require.resolve(`./json/store/messages.json`)];
    delete require.cache[require.resolve(`./json/store/${oldMessage.channel.id}.json`)];
})

// On joining new Discord server
bot.on("guildCreate", guild => {
    appendAudit(auditFile, `Guild joined: ${guild.name}`);
});

bot.on("error", err => {
    appendAudit(auditFile, err);

});

bot.on("disconnect", () => {
    appendAudit(auditFile, `> An error resulting in the Discord bot disconnecting has occured. Trying to connect again.`)
    bot.login(conf.botToken);
})

// Connect to Discord
bot.login(conf.botToken);

// 
// Express stuff
// 

// Same as module reading for Discord, but only for express modules.
// Made to be able to update the modules without restarting the bot.
fs.readdir("./modules/express/", (err, files) => {
    if (!conf.readExpressModules) return;
    appendAudit(auditFile, `> Loading Express modules`);
    let responseTime = new Date().getTime();
    if (err) return console.log(err);
    files.forEach(file => {
        let evtFunction = require(`./modules/express/${file}`);
        let evtName = file.split(".")[0];
        bot.on(evtName, (...args) => evtFunction.run(bot, ...args));
    });
    responseTime = new Date().getTime() - responseTime;
    appendAudit(auditFile, `> Finished loading Express modules (${responseTime} ms)`);
});

app.listen(expressPort, () => {
    appendAudit(auditFile, `== Express ==\n> Listening on port: ${expressPort}`);
});

app.put('/api/guild/verify/:userId(\\d+)/secret/:secretId', function (request, response) {
    let expressArgs = request.params;
    expressArgs.guildID = conf.verifyGuildID;
    expressArgs.roleID = conf.verifyRoleID;

    let cog = require(`./modules/express/put.js`);
    let roleHelper = require('./helpers/role-verification.js');

    if (!cog.verifySecret(expressArgs.secretId)) {
        respondJSON(response, { "401": "Secret is not accepted" });
        return;
    }

    appendAudit(auditFile, `\n> Verification request from: ${expressArgs.secretId}`);

    // Gets the guild by using the ID specified in the config
    let guild = bot.guilds.find(guild => guild.id, conf.verifyGuildID);

    if (!roleHelper.verifyRolePermission(guild, "MANAGE_ROLES")) {
        return respondJSON(response, { "401": "Bot lacks permission (MANAGE_ROLES)" });
    } else {
        try {
            guild.members.find(user => user.id, expressArgs.userId).addRole(expressArgs.roleID);
        } catch (e) {
            return respondJSON(response, { "401": "The user may be above the role hierarchy" });
        }

        expressArgs.secretId = undefined;
        sendRes = { "200": "User verified", "userID": expressArgs.userId, "roleID": expressArgs.roleID };
        return respondJSON(response, sendRes);
    }
});

app.post('/api/secret/generate/:botSecret', function (request, response) {
    if (request.params.botSecret !== conf.botToken) {
        appendAudit(auditFile, "bot secret mismatch");
        return response.json({ "401": "bot secret mismatch" });
    } else {
        let hat = require('hat');
        let cog = require(expressModules.POST);
        let id = cog.generateSecret();
        appendAudit(auditFile, `\n> Generated new secret: ${id}`)
        response.json({ "secretId": id });
    }
});

// Get status of the service
app.get('/api/status', function (request, response) {
    let cog = require('./modules/express/get.js');
    let res = cog.getStatus(bot.status);
    respondJSON(response, res, true);
});

app.get('/api/guild/messages/:amount', function (request, response) {

    let messages = require('./json/store/messages.json');
    let messageList = Object.keys(messages);

    let limit = request.params.amount;
    if (limit > conf.storeCount) {
        limit = conf.storeCount;
    } else if (limit < 1) {
        limit = conf.storeCount;
    }

    if (request.params.amount > messageList.length) {
        limit = messageList.length;
    }

    preparedArray = messageList.slice((messageList.length - limit), (messageList.length)).reverse();
    messageArray = {};
    preparedArray.forEach((id) => {
        messageArray[id] = messages[id];
    })

    response.type('application/xml');
    // response.send(builder.buildObject(newObj));
    response.send(builder.buildObject(messageArray));
    appendAudit(auditFile, `> GET request | Latest messages (amount: ${request.params.amount}, actual amount: ${preparedArray.length})`);

    delete require.cache[require.resolve(`./json/store/messages.json`)];
});

app.get('/api/guild/channel/:channelId/messages/:amount', function (request, response) {
    console.log('Hi!')
    let messages = require(`./json/store/${request.params.channelId}.json`);
    let messageList = Object.keys(messages);

    let limit = request.params.amount;
    if (limit > conf.storeCount) {
        limit = conf.storeCount;
    } else if (limit < 1) {
        limit = conf.storeCount;
    }

    if (request.params.amount > messageList.length) {
        limit = messageList.length;
    }

    preparedArray = messageList.slice((messageList.length - limit), (messageList.length)).reverse();
    messageArray = {};
    preparedArray.forEach((id) => {
        messageArray[id] = messages[id];
    })

    response.type('application/xml');
    // response.send(builder.buildObject(newObj));
    response.send(builder.buildObject(messageArray));
    appendAudit(auditFile, `> GET request | Latest messages (amount: ${request.params.amount}, actual amount: ${preparedArray.length}), from channel (ID: ${request.params.channelId})`);

    delete require.cache[require.resolve(`./json/store/${request.params.channelId}.json`)];
});

app.get('/api/guild/members/', function (request, response) {
    let guildMemberCount = bot.guilds.find(guild => guild.id, conf.verifyGuildID).memberCount;

    response.json({members: guildMemberCount});
});

// Reload defined Express module
app.get('/adm/reload/:type', function (request, response) {
    let type = request.params.type.toLowerCase();
    try {
        delete require.cache[require.resolve(`./modules/express/${type}.js`)];
        response.json({ 200: `Successfully reloaded ${type} module!` });
    } catch (e) {
        //  On error
    }
});

app.get('/adm/log/show', function (request, response) {
    let currentLog = fs.readFile(`./logs/${auditFile}.txt`, 'utf-8', function (err, data) {
        if (err) {
            response.send('Could not get log');
        } else {
            response.send(data);
        }
    });

    currentLog = undefined;
});

// 
// Miscellaneous functions
// 

function appendAudit(file, line, stringify = false) {
    console.log(line);
    if (stringify) {
        line = JSON.stringify(line);
    }
    fs.appendFile(`./logs/${file}.txt`, line + "\n", (err) => { if (err) console.error(err) })
}

function respondJSON(response, content, stringify) {
    appendAudit(auditFile, content, stringify);
    response.json(content);
}

function storeMessage(message) {
    messages = require('./json/store/messages');

    messages[`ID${message.content.id}`] = message;
    let messageList = Object.keys(messages);
    console.log(`> Messages added to array, current message count: ${messageList.length}`);

    if (messageList.length > conf.storeCount) {
        console.log(`> Message log capacity surpassed, removing oldest message`);
        messages[messageList.shift()] = undefined;
        fs.writeFile('./json/store/messages.json', JSON.stringify(messages, null, 4), (err) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        fs.writeFile('./json/store/messages.json', JSON.stringify(messages, null, 4), (err) => { 
            if (err) {
                console.log(err);
            } 
        });
    }

    delete require.cache[require.resolve(`./json/store/messages.json`)];
}

function storeChannelMessage(message, id) {
    file = require(`./json/store/${id}`);

    file[`ID${id}`] = message;
    let messageList = Object.keys(messages);
    console.log(`> Messages added to channel-specific array, current message count: ${messageList.length}. Channel ID: ${id}`);

    if (messageList.length > conf.storeCount) {
        console.log(`> Message log capacity surpassed for channel ID: ${id}, removing oldest message`);
        file[messageList.shift()] = undefined;
        fs.writeFile(`./json/store/${id}.json`, JSON.stringify(messages, null, 4), (err) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        fs.writeFile(`./json/store/${id}.json`, JSON.stringify(messages, null, 4), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    message = undefined;
    file = undefined;
    messageList = undefined;
    delete require.cache[require.resolve(`./json/store/${id}.json`)];
}