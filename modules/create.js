exports.run = (client, message, args, conf) => {
    var refuse = `You are not authorised to use this module.`;
    var refuseError = "notGuildOwner";
    if (message.author.id != message.guild.ownerID) return errorMessage(refuseError, refuse);
    var errorType, causeMessage, doneMessage;

    switch (args[0]) {
        case "":
            errorMessage("missingArgument", `No argument specified`);
            break;
        default:
            errorMessage("invalidArgument", `Invalid Argument ${args[0]}`);
    }

    function successMessage(use, msg) {
        return message.channel.sendMessage("", { embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            title: `Success! ${use} has been created`,
            description: `${msg}`,
            timestamp: new Date(),
            footer: {
                icon_url: message.author.avatarURL,
                text: `${message.author.username}`
            }
        }});
    }

    function errorMessage(error, causeMessage) {
        return message.channel.sendMessage("", { embed: {
            color: 16711680,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            title: `Error: ${error}`,
            description: `${causeMessage}\n For more info, type "${conf.prefix}help create".`,
            timestamp: new Date(),
            footer: {
                icon_url: message.author.avatarURL,
                text: `${message.author.username}`
            }
        }});
    }
}