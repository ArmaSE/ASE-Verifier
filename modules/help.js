exports.run = (client, message, args, conf) => {
    message.channel.sendMessage("", {embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL,
                },
                title: '*__List of available commands__*',
                fields: [{
                    name: 'help',
                    value: '    This command'
                },
                {
                    name: 'ping',
                    value: '    Simple test message to test the bot`s responsiveness'  
                },
                {
                    name: 'prefix',
                    value: 'Change the current prefix of the bot'
                },
                {
                    name: 'debug',
                    value: 'Turn debug mode on or off'
                },
                {
                    name: 'led',
                    value: 'Poka LEDa!'
                },
                {
                    name: 'set',
                    value: `Change individual bot settings`
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: message.author.avatarURL,
                    text: `${message.author.username}`
                }}});
}