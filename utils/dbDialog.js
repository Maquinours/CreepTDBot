const mysql = require("mysql");
const config = require("../config.json");

module.exports = dbDialog = {
    connectDB: async function() {
        this.db = await mysql.createConnection({
            host: config.db.host,
            user: config.db.user,
            password: config.db.pwd,
            database: config.db.db
        });
    },
    insertUser: async function(discordID, creepName) {
        const sql = "INSERT INTO users(discord_id, creeptd_username) VALUES(?, ?)";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [discordID, creepName], (err, results) => {
            if (err) {
                reject(err);
            }
            else
                resolve(results);
        }));
        return results;
    },
    deleteUser: async function(discordID) {
        const sql = "DELETE FROM users WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [discordID], (err, results) => {
            if (err)
                reject(err);
            else
                resolve(results);
        }));
        return results;
    },
    getCreepName: async function(discordID) {
        const sql = "SELECT creeptd_username FROM users WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [discordID], (err, results) => {
            if (err)
                reject(err);
            else {
                if (results.length < 1)
                    reject(new Error('NO_DATA'));
                else
                    resolve(results);
            }
        }));
        if (results && results[0] && results[0].creeptd_username)
            return results[0].creeptd_username;
        return results;
    },
    insertGuild: async function(guildID) {
        let sql = "INSERT INTO guilds(discord_id, language) VALUES(?, 0)";
        let result = await new Promise((resolve, reject) => this.db.query(sql, [guildID], (err, results) => {
            if (err)
                reject(err);
            else
                resolve(results);
        }));
        return result;
    },
    updateLanguage: async function(guildID, languageID) {
        let sql = "UPDATE guilds SET language=(SELECT id FROM languages WHERE code=?) WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [languageID, guildID], async (err, results) => {
            if (err)
                reject(err);
            else {
                if (results.affectedRows === 0) {
                    sql = "INSERT INTO guilds(discord_id, language) VALUES(?, (SELECT id FROM languages WHERE code=?))";
                    results = await new Promise((resolve, reject) => this.db.query(sql, [guildID, languageID], (err, results) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(results);
                        }
                    }));
                }
                else if (results.changedRows === 0) {
                    reject(new Error('NO_DATA_CHANGED'));
                }
                else
                    resolve(results);
            }
        }));
        return results;
    },
    getLanguage: async function(guildID) {
        let sql = "SELECT LA.code FROM languages LA JOIN guilds GU ON LA.id=GU.language WHERE GU.discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [guildID], (err, results) => {
            if (err)
                reject(err);
            else {
                if (results.length < 1)
                    reject(new Error('NO_DATA'));
                else
                    resolve(results);
            }
        }));
        if (results && results[0] && results[0].code)
            return results[0].code;
        return results;
    }
}