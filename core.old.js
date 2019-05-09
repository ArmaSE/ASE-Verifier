const Discord = require('discord.js')
const Express = require('express')
const fs = require('fs')
const config = require('./config.json')

// Instantiate
const bot = new Discord.Client()
const app = Express()

app.set('json spaces', 4)

bot.on('ready', () => {
    console.log('Client connected')
    bot.user.setActivity(config.nowPlaying, {type: `${config.nowPlayingType}`, url: `${config.nowPlayingLink}`})
})

bot.on('message', msg => {
    if (msg.author.bot) return;

    if (msg.content == '§test') {
        msg.react('👍')
    }
})

app.get('/testGET', function (request, response) {
    response.json({"response":"GET Request processed successfully"})
})

var server = app.listen(8081, function () {
    var host = server.address().adress
    var port = server.address().port
    console.log(`server listening at http://${host}:${port}`)
})

bot.login(config.botToken)