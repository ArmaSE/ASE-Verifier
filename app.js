const startTime = new Date().getTime();
const auditFile = startTime;

const Discord = require('discord.js');
const Express = require('express');
const fs = require('fs');
const conf = require('./json/conf.json');
global.conf = conf;

var initialized = false;
const bot = new Discord.Client();
const app = Express();
const expressPort = conf.port;

// On successful connection to Discord
bot.on("ready", () => {
    init();
});

// Initialize the bot.
function init() {
    if (initialized) return;

    conf.botName = bot.user.username;
    conf.botID = bot.user.id;
    bot.user.setActivity(conf.activity, {type: "PLAYING"});

    console.log(`== Discord ==\n`+
    `> Successfully connected to Discord (${new Date().getTime() - startTime} ms)!\n`+
    `> Name of bot: ${bot.user.username}\n`+
    `> Current activity: ${conf.activity}\n`+
    `> Bot ID: ${conf.botID}\n`+
    `> Prefix: ${conf.prefix}\n`+
    `> Enable guild command cogs: ${conf.enableResponses}\n`+
    `> Developer mode: ${conf.indev}\n`+
    `== EndInit ==`);
    appendAudit(auditFile, `== Discord ==\n> Successfully connected to Discord (${new Date().getTime() - startTime} ms)!\n> Name of bot: ${bot.user.username}\n> Current activity: ${conf.activity}\n> Bot ID: ${conf.botID}\n> Prefix: ${conf.prefix}\n> Enable guild command cogs: ${conf.enableResponses}\n> Developer mode: ${conf.indev}\n== EndInit ==`);
    initialized = true;
    fs.writeFile('.//json/conf.json', JSON.stringify(conf, null, 4), (err) => { if (err) console.error(err) });
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
    if (conf.enableResponses == false) return; // Return no answer if this variable is set to false in the config

    // Trim content, ignore if author is bot, and only continue if prefix is present
    const message = msg.content.trim();
    if (msg.author.bot) return;
    if (!msg.content.startsWith(conf.prefix)) return;

    // Split the whole message per word into argument array, and initial command variable
    let args = msg.content.split(" ").slice(1);
    const command = message.split(/[ \n]/)[0].substring(conf.prefix.length).toLowerCase().trim();

    try {
        // If command corresponds to cog with the same name, continue and pass message info and arguments to the cog
        let cmdFile = require(`./modules/${command}.js`);
        cmdFile.run(bot, msg, args, conf);

    } catch (e) {
        // Module not found, send error message in channel, and log the error in the console
        console.error(e);
        msg.channel.sendMessage("", { embed: {
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
        }});
    }
});

// On joining new Discord server
bot.on("guildCreate", guild => {
    console.log(`Guild joined: ${guild.name}`);
    appendAudit(auditFile, `Guild joined: ${guild.name}`);
});

// Connect to Discord
bot.login(conf.botToken);

// 
// Express stuff
// 

// Same as module reading for Discord, but only for express modules.
// Made to be able to update the modules without restarting the bot.
// fs.readdir("./modules/express/", (err, files) => {
//     console.log(`> Loading Express modules`);
//     let responseTime = new Date().getTime();
//     if (err) return console.log(err);
//     files.forEach(file => {
//         let evtFunction = require(`./modules/express/${file}`);
//         let evtName = file.split(".")[0];
//         bot.on(evtName, (...args) => evtFunction.run(bot, ...args));
//     });
//     responseTime = new Date().getTime() - responseTime;
//     console.log(`> Finished loading Express modules (${responseTime} ms)`);
// });

app.listen(expressPort, () => {
    console.log(`== Express ==\n> Listening on port: ${expressPort}`);
    appendAudit(auditFile, `== Express ==\n> Listening on port: ${expressPort}`);
});

app.get('/api/verify/:userId(\\d+)/secret/:secretId', function (request, response) {
    let expressArgs = request.params;
    expressArgs.guildID = conf.verifyGuildID;
    expressArgs.roleID = conf.verifyRoleID;
    let expressModule = require(`./modules/express/get.js`);
    let keys = require('./json/keys.json').list;

    // Check if transmitted secret is valid
    accept = false;

    for (var i = 0; i < keys.length; i++) {
        if (keys[i] == expressArgs.secretId) {
            accept = true;
        }
    }

    if (!accept) {
        response.json({"401": "Key is not accepted", "secret": expressArgs.secretId});
        return;
    }

    console.log(`\n> Verification request from: ${expressArgs.secretId}`);
    appendAudit(auditFile, `\n> Verification request from: ${expressArgs.secretId}`);

    // Gets the guild by using the ID specified in the config
    let guild = bot.guilds.find(guild => guild.id, conf.verifyGuildID);

    if (!guild.me.hasPermission("MANAGE_ROLES")) {
        console.log(`\n> Bot instance lacks permission: MANAGE_ROLES`);
        appendAudit(auditFile, `\n> Bot instance lacks permission: MANAGE_ROLES`);
        return response.json({"401": "Bot lacks permission"});
    } else {
        try {
            guild.members.find(user => user.id, expressArgs.userId).addRole(expressArgs.roleID)
        } catch (e) {
            console.log(e);
            appendAudit(auditFile, "The user may be above the role hierarchy");
            return response.json({"401": "The user may be above the role hierarchy"});
        }
        
        console.log(expressArgs);
        appendAudit(auditFile, expressArgs)
        expressArgs.secretId = undefined;
        response.send(expressArgs);
        return;
    }
});

app.get('/api/secret/generate/:botSecret', function (request, response) {
    if (request.params.botSecret !== conf.botToken) {
        appendAudit(auditFile, "bot secret mismatch");
        return response.json({"401": "bot secret mismatch"});
    } else {
        let hat = require('hat');
        let id = hat();

        let keysFile = require('./json/keys.json');
        keysFile.list.push(id);
        fs.writeFile('.//json/keys.json', JSON.stringify(keysFile, null, 4), (err) => { if (err) console.error(err) });

        appendappendAudit(auditFile, `\n> Generated new secret: ${id}`)
        console.log(`\n> Generated new secret: ${id}`);
        response.json({"secretId": id});
    }
});

app.get('/api/status', function (request, response) {
    // TODO - write in-depth status response code
    response.json({"status": 200});
    console.log(`\nstatus requested, current status = 200`);
    appendAudit(auditFile, `\nstatus requested, current status = 200`);
});

// 
// Miscellaneous functions
// 

function appendAudit(file, line) {
    fs.appendFile(`./logs/${file}.txt`, line, (err) => { if (err) console.error(err) })
}