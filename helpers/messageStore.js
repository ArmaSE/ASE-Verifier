exports.convertMessage = (message) => {
    // authorObject = id, name, avatarURL
    // contentObject = time, url, string, attachments
    let config = require('../json/conf.json');
    if (message.channel.id == config.getMessagesFrom) {
        let authorObject = {
            id: message.author.id,
            name: message.author.tag,
            avatarURL: message.author.avatarURL
        }
        contentObject = {
            time: message.createdTimestamp,
            url: message.url,
            id: message.id,
            string: message.content
        }
    
        if (message.attachments != undefined) {
            contentObject.attachments = [];
            message.attachments.forEach((attachment) => {
                contentObject.attachments.push(attachment.proxyURL);
            });
        }

        let convertedMessage = {};
        convertedMessage.author = authorObject;
        convertedMessage.content = contentObject;

        return convertedMessage;
    } else {
        return;
    }
}
