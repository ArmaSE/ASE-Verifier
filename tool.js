const sql = require('sqlite3').verbose();
const inq = require('inquirer');
const prog = require('progress');

function prepare_db() {
    console.log('---> Create main.db <---');
    let db = new sql.Database('./main.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    let defaults = require('./json/default.json');

    let query_list = [
        'CREATE TABLE IF NOT EXISTS settings (setting VARCHAR(32) UNIQUE PRIMARY KEY, value VARCHAR(128), editable INTEGER DEFAULT 0);',
        'CREATE TABLE IF NOT EXISTS logs (log_id INTEGER PRIMARY KEY AUTOINCREMENT, severity VARCHAR(1), action VARCHAR(128), timestamp VARCHAR(64));',
        'CREATE TABLE IF NOT EXISTS app_keys (key_id INTEGER PRIMARY KEY AUTOINCREMENT, key VARCHAR(128) UNIQUE, description TEXT);',
        `CREATE TABLE IF NOT EXISTS message_store (message_id VARCHAR(64) PRIMARY KEY UNIQUE, author_id VARCHAR(64),
        author_name VARCHAR(64), author_avatar TEXT, guild_id VARCHAR(64), guild_name VARCHAR(64), channel_id VARCHAR(64), 
        channel_name VARCHAR(64), time VARCHAR(64), message_url TEXT, message_content TEXT, message_attachments TEXT);`,
        `INSERT INTO settings VALUES ('bot_name', ' ', 0);`,
        `INSERT INTO settings VALUES ('bot_id', ' ', 0);`,
        `INSERT INTO settings VALUES ('bot_token', ' ', 1);`,
        `INSERT INTO settings VALUES ('bot_version', '${defaults.bot_version}', 0);`,
        `INSERT INTO settings VALUES ('bot_indev', '${defaults.bot_indev}', 1);`,
        `INSERT INTO settings VALUES ('bot_prefix', '${defaults.bot_prefix}', 1);`,
        `INSERT INTO settings VALUES ('bot_enable_responses', '${defaults.bot_enable_responses}', 1);`,
        `INSERT INTO settings VALUES ('bot_activity', ' ', 1);`,
        `INSERT INTO settings VALUES ('bot_guild_id', ' ', 1);`,
        `INSERT INTO settings VALUES ('bot_verify_role_id', ' ', 1);`,
        `INSERT INTO settings VALUES ('app_port', '${defaults.app_port}', 1);`,
        `INSERT INTO settings VALUES ('app_read_express_modules', '${defaults.app_read_express_modules}', 1);`,
        `INSERT INTO settings VALUES ('app_store_messages', '${defaults.app_store_messages}', 1);`,
        `INSERT INTO settings VALUES ('app_store_amount', '${defaults.app_store_amount}', 1);`
    ];
    
    let pb = new prog(`Creating main.db [:bar] :current/:total :percent`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: query_list.length
    });

    db.serialize(() => {
        for (var i = 0; i < query_list.length; i++) {
            db.run(query_list[i], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
            pb.tick({
                'token1': query_list[i]
            });
        }
        console.log('Database main.db has been created successfully!')
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            tool_menu();
        });
    });
}

function editSettings() {
    let db = new sql.Database('./main.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    let settinglist = [];

    let query = 'SELECT setting setting, value value, editable editable FROM settings ORDER BY setting;';
    let longestname = 24;

    db.all(query, (err, rows) => {
        if (err) {
            throw err;
        }
        let curr = 1;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].editable == "1") {
                if (rows[i].setting.length > longestname) {
                    longestname = rows[i].setting.length;
                }

                let tempstring = rows[i].setting;
                let diff = longestname - rows[i].setting.length;

                for (var j = 0; j < diff; j++) {
                    tempstring += " ";
                }

                if (curr < 10) {
                    curr = "0" + curr;
                }

                settinglist.push(`${curr} ${tempstring} = ${rows[i].value}`);

                
                curr++;
            }
        }

        settinglist.push(new inq.Separator());
        settinglist.push("== exit ==");
        settinglist.push(new inq.Separator());

        qs = [
            {
                type: 'list',
                name: 'settings_menu',
                message: 'Choose which setting to edit:',
                choices: settinglist,
                filter: function (val) {
                    if (val == "== exit ==") {
                        return;
                    } else {
                        return val.split(' ')[1];
                    }
                }
            },
            {
                type: 'input',
                name: 'setting_value',
                message: 'New value (Empty to abort):'
            }
        ];

        inq.prompt(qs).then(answer => {
            if (answer.settings_menu == "exit" || answer.setting_value == "") {
                console.log('=== Abort ===');
                db.close((err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                });
                tool_menu();
            } else {
                query = `UPDATE settings
                    set value = ? WHERE setting = '${answer.settings_menu}';`;
                db.run(query, [answer.setting_value], function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log(`>> Setting "${answer.settings_menu}" has been updated to "${answer.setting_value}"`);
                    editSettings();
                });
            }
        });
    });
}

function tool_menu() {
    console.log('==== ASE Verificator Management Tool ====');
    l1 = {
        type: 'list',
        name: 'main_menu',
        message: 'Choose an option:',
        choices: [
            '[1] Create main.db           - Creates new main.db with default settings. Will need configuration.',
            '[2] Edit bot/app settings    - Edit settings related to the bot or app in main.db',
            '[3] Check Audit logs         - Check the latest Audit log output',
            new inq.Separator(),
            '[4] Clear console            - Clears the console of any previous output',
            '[5] Exit tool                - Exit the Management Tool'
        ],
        filter: function(val) {
            return parseInt(val.charAt(1));
        }
    }

    inq.prompt(l1).then(answer => {
        switch(answer.main_menu) {
            case 1:
                prepare_db();
                break;
            case 2:
                editSettings();
                break;
            case 4:
                process.stdout.write("\u001b[2J\u001b[0;0H");
                tool_menu();
                break;
            case 5:
                console.log('Exited ASE Verificator Management Tool!');
                process.exit(0);
                break;
            default:
                tool_menu();
                break;
        }
    });
}

tool_menu();