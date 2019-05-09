exports.run = (client, message, args, conf) => {
    message.channel.sendMessage("", {
        embed: {
            color: 16766720,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL
            },
            title: `Pong!`,
            timestamp: new Date(),
            footer: {
                icon_url: message.author.avatarURL,
                text: `${message.author.username}`
            }
        }
    });
}