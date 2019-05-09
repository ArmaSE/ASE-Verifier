exports.run = (client, message, args, conf) => {
    const fs = require('fs');
    var refuse = `You are not authorised to use this module`;
    var refuseError = "insufficientPerms";
    if (message.author.id != conf.OwnerID) return errorMessage(refuseError, refuse);
    var errorType, causeMessage, doneMessage;
    
    //determine first arg:
    switch(args[0].toLowerCase()) {
        case "set":
            //modify bot settings:
            switch(args[1].toLowerCase()) {
                //checks next arg:
                case "game":
                case "nowplaying":
                    // TODO: Change "Now playing" message
                    break;
                default:
                    errorType = "invalidParameter"
                    if (args[1] = undefined) {
                        causeMessage = "No paramater has been entered."
                    }else {
                        causeMessage = "Invalid parameter has been entered."
                    }
                    errorMessage(errorType, causeMessage);
                    break;
            }
            break;
        case "check":
            //display chosen settings:
            break;
        default:
            errorType = "invalidParameter"
            if (args[0] = undefined) {
                causeMessage = "No paramater has been entered."
            }else {
                causeMessage = "Invalid parameter has been entered."
            }
            errorMessage(errorType, causeMessage);
            break;
    }

    function successMessage(use, msg) {
        return message.channel.sendMessage("", { embed: {
            color: 3447003,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
            },
            title: `Success! ${use}`,
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
            description: `${causeMessage}\n For more info, type **"${conf.prefix}help admin"**`,
            timestamp: new Date(),
            footer: {
                icon_url: message.author.avatarURL,
                text: `${message.author.username}`
            }
        }});
    }
}