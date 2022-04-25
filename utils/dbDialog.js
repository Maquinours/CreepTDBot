const mysql = require("mysql");
const config = require("../config.json");

module.exports = dbDialog = {
    connectDB: async function () {
        this.db = await mysql.createConnection({
            host: config.db.host,
            user: config.db.user,
            password: config.db.pwd,
            database: config.db.db
        });

        this.db.connect(function (err) {
            if (err) throw err;
        });
    },
    insertUser: async function (userId, creeptdUsername) {
        if (!(typeof (userId) == 'string' && typeof (creeptdUsername) == 'string')) throw new Error('Variable type error');

        const sql = "INSERT INTO users(discord_id, creeptd_username) VALUES(?, ?)";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [userId, creeptdUsername], (err, results) => {
            if (err) {
                reject(err);
            }
            else
                resolve(results);
        }));
        return results;
    },
    deleteUser: async function (userId) {
        if (!(typeof (userId) == 'string')) throw new Error('Variable type error');

        const sql = "DELETE FROM users WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [userId], (err, results) => {
            if (err)
                reject(err);
            else
                resolve(results);
        }));
        return results;
    },
    getCreepName: async function (userId) {
        if (!(typeof (userId) == 'string')) throw new Error('Variable type error');

        const sql = "SELECT creeptd_username FROM users WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [userId], (err, results) => {
            if (err)
                reject(err);
            else if (results.length < 1)
                reject(new Error('NO_DATA'));
            else
                resolve(results);
        }));
        return results[0].creeptd_username;
    },
    insertGuild: async function (guildId) {
        if (!(typeof (guildId) == 'string')) throw new Error('Variable type error');

        let sql = "INSERT INTO guilds(discord_id, language) VALUES(?, 0)";
        let result = await new Promise((resolve, reject) => this.db.query(sql, [guildId], (err, results) => {
            if (err)
                reject(err);
            else
                resolve(results);
        }));
        return result;
    },
    updateLanguage: async function (guildId, languageCode) {
        if (!(typeof (guildId) == 'string' && typeof (languageCode) == 'string')) throw new Error('Variable type error');

        let sql = "UPDATE guilds SET language=(SELECT id FROM languages WHERE code=?) WHERE discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [languageCode, guildId], async (err, results) => {
            if (err)
                reject(err);
            if (results.changedRows === 0)
                reject(new Error('NO_DATA_CHANGED'));
            else
                resolve(results);
        }));
        return results;
    },
    getLanguage: async function (guildId) {
        if (!(typeof (guildId) == 'string')) throw new Error('Variable type error');

        let sql = "SELECT LA.code FROM languages LA JOIN guilds GU ON LA.id=GU.language WHERE GU.discord_id=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [guildId], (err, results) => {
            if (err)
                reject(err);
            else {
                if (results.length < 1)
                    reject(new Error('NO_DATA'));
                else
                    resolve(results);
            }
        }));
        return results[0].code;
    }
}