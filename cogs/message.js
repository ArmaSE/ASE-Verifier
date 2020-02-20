class Djs {
    constructor() {}

    message(bot, command, args, msg, settings) {
        switch (command) {
            case "members":
                switch(args[0]) {
                    case "roles":
                        switch(args[1]) {
                            case "force":
                                let roleName = args[2].replace("_"," ");
                                console.log(roleName);
                                let role = msg.guild.roles.find(r => r.name == roleName);
    
                                if (!role) return msg.channel.send(`**${msg.author.username}**, roll kunde ej hittas.`);
    
                                msg.guild.members.filter(m => !m.user.bot).forEach(member => member.addRole(role))
                                msg.channel.send(`**${msg.author.username}**, role **${role.name}** har tilldelats till samtiliga medlemmar.`)
                                break;
                            default:
                                return;
                        }
                        break;
                    default:
                        return;
                }
                break;
            default:
                return;
        }
    }
}

module.exports = Djs;