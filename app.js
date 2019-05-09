const Discord = require('discord.js');
const Express = require('express');
const fs = require('fs');
const conf = require('./json/conf.json');

var initialized = false;
const bot = new Discord.Client();
const app = Express();

bot.on("ready", () => {
    init();
});

// Initialize the bot.
function init() {
    if (initialized) return;
    conf.botName = bot.user.username;
    conf.botID = bot.user.id;
    bot.user.setActivity(conf.activity, {type: "PLAYING"});
    console.log(`
    ====
    Successfully connected to Discord!
    >Name of bot: ${bot.user.username}
    >Bot ID: ${conf.botID}
    >Prefix: ${conf.prefix}
    >Enable guild command cogs: ${conf.enableResponses}
    ====
    Trying to start Express:`);
    initialized = true;
    fs.writeFile('.//json/conf.json', JSON.stringify(conf, null, 4), (err) => { if (err) console.error(err) });
}

// Funtion to read in the dynamic cogs ('modules' folder), except for modules in "modules/express"
fs.readdir("./modules/", (err, files) => {
    if (conf.enableResponses == false) return; // Return no answer if this variable is set to false in the config

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
bot.on("guildCreate", guild => {
    console.log(`Guild joined: ${guild.name}`)
});

bot.login(conf.botToken);