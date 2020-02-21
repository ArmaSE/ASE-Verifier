class user {
    constructor() {
        this.settings = null;
    }
    
    find(bot, username, guildid=null) {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }

        let sql = this.sql;
        let guild = null;
        sql.toLog(`User search request, name: ${username}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`);
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to find user', 'api_user', 1);
            return false;
        }
        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${username}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let match = server.members.find(m => m.displayName === username);

                        if (match === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false)
                        }
                        let response = {
                            displayname: match.displayName,
                            fullname: `${match.user.username}#${match.user.discriminator}`,
                            id: match.user.id,
                            avatar: match.user.avatarURL,
                            presence: match.presence,
                            jointime: match.joinedTimestamp,
                            roles: match.roles
                        }
                        sql.toLog(`Accessed properties of user ${match.displayName}`, 'api_user');
                        resolve(response);
                    }).catch((err) => {
                        sql.toLog('User search returned no results', 'api_user', 1)
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${username}`, 'api_user', 1);
                resolve(false);
            }
        });
    }

    show(bot, userid, guildid=null) {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }

        let sql = this.sql;
        let guild = null;
        sql.toLog(`User profile request, ID: ${userid}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`);
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to find user', 'api_user', 1);
            return false;
        }

        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${userid}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let match = server.members.find(m => m.id === userid);

                        if (match === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false);
                        }
                        let roleList = match.roles.array();
                        let newRoleList = new Array();
                        roleList.forEach(element => {
                            newRoleList.push({id: element.id, role: element.name});
                        });
                        let response = {
                            displayname: match.displayName,
                            fullname: `${match.user.username}#${match.user.discriminator}`,
                            id: match.user.id,
                            avatar: match.user.avatarURL,
                            presence: match.presence,
                            jointime: match.joinedTimestamp,
                            roles: newRoleList
                        }
                        sql.toLog(`Accessed properties of user ${match.displayName}`, 'api_user');
                        resolve(response);
                    }).catch((err) => {
                        sql.toLog('User show returned no results', 'api_user', 1)
                        console.log(err);
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${userid}`, 'api_user', 1);
                console.log(e);
                resolve(false);
            }
        });
    }

    verify(bot, userid, roleid=null, guildid=null) {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }
        if (roleid === null) {
            roleid = this.settings['bot_verify_role_id'];
        }

        let sql = this.sql;
        let guild = null;
        let msghelper = this.msghelper;
        let logChannel = this.settings['bot_log_channel_id'];
        let guestRole = this.settings['bot_guest_role_id'];
        sql.toLog(`User verify request, ID: ${userid}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`, 'api_user');
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to verify user', 'api_user', 1);
            return false;
        }

        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${userid}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let result = server.members.find(m => m.id === userid);
                        if (result === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false);
                        }
                        sql.toLog(`Accessed properties of user "${result.displayName}"`, 'api_user');
                        result.addRole(roleid).then(function () {
                            sql.toLog(`User successfully verified`, 'api_user');
                            result.removeRole(guestRole);
                            try {
                                msghelper.discord.sendAlert(bot, ':white_check_mark: Ny verifiering', `**Användare:** ${result.displayName} (${userid})\n\nKontot är nu verifierat.`, logChannel, result.user.avatarURL);
                                result.send(`Tack för att du validerade ditt Discord-konto. Välkommen till Arma Sweden!`);
                            } catch (e) {
                                console.log(e)
                            }
                            resolve(true);
                        }).catch((e) => {
                            sql.toLog('User verification could not be completed. User may be higher in hierarchy', 'api_user');
                            sql.toLog(e, 'error', 2);
                            resolve(result);
                        });
                        resolve(true);
                    }).catch((err) => {
                        sql.toLog('User search returned no results', 'api_user', 1);
                        sql.toLog(err, 'error', 2);
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${userid}`, 'api_user', 1);
                resolve(false);
            }
        });
    }

    invalidate(bot, userid, roleid=null, guildid=null) {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }
        if (roleid === null) {
            roleid = this.settings['bot_verify_role_id'];
        }

        let sql = this.sql;
        let guild = null;
        let msghelper = this.msghelper;
        let logChannel = this.settings['bot_log_channel_id'];
        let guestRole = this.settings['bot_guest_role_id'];
        sql.toLog(`User invalidate request, ID: ${userid}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`, 'api_user');
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to invalidate user', 'api_user', 1);
            return false;
        }

        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${userid}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let result = server.members.find(m => m.id === userid);
                        if (result === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false);
                        }
                        sql.toLog(`Accessed properties of user "${result.displayName}"`, 'api_user');
                        result.removeRole(roleid).then(function () {
                            result.addRole(guestRole);
                            sql.toLog(`User successfully invalidated`, 'api_user');
                            try {
                                msghelper.discord.sendAlert(bot, ':negative_squared_cross_mark: Ny avverifiering', `**Användare:** ${result.displayName} (${userid})\n\nKontot är ej längre verifierat.`, logChannel, result.user.avatarURL);
                                result.send(`Du är inte längre validerad hos Arma Sweden. Vi hoppas på att få se dig snart igen!`);
                            } catch (e) {
                                console.log(e)
                            }
                            resolve(true);
                        }).catch((e) => {
                            sql.toLog('User invalidation could not be completed. User may be higher in hierarchy', 'api_user');
                            sql.toLog(e, 'error', 2);
                            resolve(false);
                        });
                    }).catch((err) => {
                        sql.toLog('User search returned no results', 'api_user', 1);
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${userid}`, 'api_user', 1);
                resolve(false);
            }
        });
    }

    kick(bot, userid, reason=null, guildid=null) {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }

        if (reason === null) {
            reason = undefined;
        }

        let sql = this.sql;
        let guild = null;
        sql.toLog(`User kick request, ID: ${userid}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`, 'api_user');
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to kick user', 'api_user', 1);
            return false;
        }

        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${userid}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let result = server.members.find(m => m.id === userid);
                        if (result === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false);
                        }
                        sql.toLog(`Accessed properties of user "${result.displayName}"`, 'api_user');
                        result.kick().then(function () {
                            sql.toLog(`User successfully kicked`, 'api_user');
                            resolve(true);
                        }).catch((e) => {
                            sql.toLog('User kick could not be completed. User may be higher in hierarchy', 'api_user');
                            sql.toLog(e, 'error', 2);
                            resolve(false);
                        });
                    }).catch((err) => {
                        sql.toLog('User search returned no results', 'api_user', 1);
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${userid}`, 'api_user', 1);
                resolve(false);
            }
        });
    }

    ban() {
        if (guildid === null) {
            guildid = this.settings['bot_guild_id'];
        }

        if (reason === null) {
            reason = undefined;
        }

        let sql = this.sql;
        let guild = null;
        sql.toLog(`User ban request, ID: ${userid}`, 'api_user');
        try {
            sql.toLog(`Trying to access properties of guild ${guildid}`, 'api_user');
            guild = bot.guilds.find(guild => guild.id, this.settings['bot_guild_id']);
        } catch (e) {
            sql.toLog('Guild could not be found when trying to ban user', 'api_user', 1);
            return false;
        }

        return new Promise(function (resolve, reject) {

            try {
                sql.toLog(`Trying to access properties of user ${userid}`, 'api_user');
                guild.fetchMembers()
                    .then((server) => {
                        let result = server.members.find(m => m.id === userid);
                        if (result === false) {
                            sql.toLog('User search returned null', 'api_user', 1);
                            resolve(false);
                        }
                        sql.toLog(`Accessed properties of user "${result.displayName}"`, 'api_user');
                        result.kick().then(function () {
                            sql.toLog(`User successfully banned`, 'api_user');
                            resolve(true);
                        }).catch((e) => {
                            sql.toLog('User ban could not be completed. User may be higher in hierarchy', 'api_user');
                            sql.toLog(e, 'error', 2);
                            resolve(false);
                        });
                    }).catch((err) => {
                        sql.toLog('User search returned no results', 'api_user', 1);
                        resolve(false);
                    });
            } catch (e) {
                sql.toLog(`Could not access properties of user ${userid}`, 'api_user', 1);
                resolve(false);
            }
        });
    }

    get sql() {
        let dbjs = require('./db.js');
        return new dbjs();
    }

    get msghelper() {
        let msghelp = require('./msg-helper.js');
        return new msghelp();
    }

    set setSettings(settings) {
        let sql = this.sql;
        sql.toLog(`synchronized settings with api_user`, `api_user`);
        this.settings = settings;
    }
}

module.exports = user;