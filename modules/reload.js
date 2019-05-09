exports.run = (client, message, args, conf) => {
    try {
        if (args[0] == undefined) return message.channel.sendMessage("", {
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                fields: [{
                    name: `*__Error__*`,
                    value: `missing name of command to reload!`
                },
                {
                    name: `*__Usage of reload:__*`,
                    value: `${conf.prefix}reload <command_name>`
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: message.author.avatarURL,
                    text: `${message.author.username}`
                }
            }
        });
        delete require.cache[require.resolve(`../modules/${args[0]}.js`)];
        message.channel.sendMessage("", { embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            description: `module ${args[0]} has been reloaded`,
            timestamp: new Date(),
            footer: {
                    icon_url: message.author.avatarURL,
                    text: `${message.author.username}`
            }
        }});
    } catch (err) {
        console.error(err);
    }
};