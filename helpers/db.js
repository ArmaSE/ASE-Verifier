class main {
    constructor() {
        this.sql = require('sqlite3').verbose();
    }
    connect() {
        let db = new this.sql.Database('./main.db', (err) => {
            if (err) {
                throw new Error('Could not connect to db.');
            }
        });
    
        return db;
    }

    toLog(action, category='general', severity=0, timestamp=new Date().toUTCString()) {
        let log_st = this.connect();
        console.log(`LOG - ${category} - [` + severity + ']: ' + action);
    
        if (action != null) {
            let query = `INSERT INTO logs (severity, action, category, timestamp) VALUES ('${severity}', '${action}', '${category}', '${timestamp}');`;
    
            log_st.run(query, [], function (err) {
                if (err) {
                    console.log(err);
                }
                log_st.close();
                return true;
            });
        } else {
            return console.error('toLog: action not defined, can not add new entry to db.');
        }
    }

    fromLog(amount=100, category=null, severity=null) {
        let temp_db = new main();
        this.toLog(`Attempting to retrieve a maximum of ${amount} log entries from logs table`, 'logs');
        let db = this.connect();
        let query;
    
        if (category !== null && severity !== null) {
            // Limit search by category, severity and log amount
            this.toLog(`Limiting search by category: ${category} and severity: ${severity}`, 'logs');
            query = `SELECT * FROM logs WHERE category = '${category}' AND severity = '${severity}' ORDER BY log_id DESC LIMIT ${amount};`;
        } else if (category !== null) {
            // Limit search by category and log amount
            this.toLog(`Limiting search by category: ${category}`, 'logs');
            query = `SELECT * FROM logs WHERE category = '${category}' ORDER BY log_id DESC LIMIT ${amount};`;
        } else if (severity !== null) {
            // Limit search by severity and log amount
            this.toLog(`Limiting search by severity: ${severity}`, 'logs');
            query = `SELECT * FROM logs WHERE severity = '${severity}' ORDER BY log_id DESC LIMIT ${amount};`;
        } else {
            // Limit only by log amount
            query = `SELECT * FROM logs ORDER BY log_id DESC LIMIT ${amount};`;
        }
        return new Promise(function(resolve, reject) {
            db.all(query, [], function (err, rows) {
                if (err) {
                    this.toLog(`Retrieval of log entries failed`, 'logs_alert', 1);
                    reject(null);
                }

                let templist = [];
                let entrylist = {};
                let varlist = [];
                let counter = 0;

                rows.forEach((row) => {
                    let entry = {
                        log_id: row.log_id,
                        severity: row.severity,
                        action: row.action,
                        category: row.category,
                        timestamp: row.timestamp
                    }

                    templist.push(entry);
                    counter++;
                });

                temp_db.toLog(`Managed to retrieve ${counter} log entries from logs table`, 'logs');
                resolve(templist);
            });
        })
    }
}

module.exports = main;