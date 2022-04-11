var dbDialog = {
    connectDB: async function() {
        this.db = mysql.createConnection({
            host: config.db.host,
            user: config.db.user,
            password: config.db.pwd,
            database: config.db.db
        });
    },
    insertUser: async function(discordID, creepName) {
        const sql = "INSERT INTO users VALUES(?, ?)";
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
        const sql = "SELECT creeptd_name FROM users WHERE discord_id=?";
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
        if (results && results[0] && results[0].creeptd_name)
            return results[0].creeptd_name;
        return results;
    },
    insertGuild: async function(guildID) {
        let sql = "INSERT INTO guilds VALUES(?, 1)";
        let result = await new Promise((resolve, reject) => this.db.query(sql, [guildID], (err, results) => {
            if (err)
                reject(err);
            else
                resolve(results);
        }));
        return result;
    },
    updateLanguage: async function(guildID, languageID) {
        let sql = "UPDATE guilds SET id_language=(SELECT id_language FROM languages WHERE code_language=?) WHERE id_guild=?";
        let results = await new Promise((resolve, reject) => this.db.query(sql, [languageID, guildID], async (err, results) => {
            if (err)
                reject(err);
            else {
                if (results.affectedRows == 0) {
                    sql = "INSERT INTO guilds VALUES(?, (SELECT id_language FROM languages WHERE code_language=?))";
                    results = await new Promise((resolve, reject) => this.db.query(sql, [guildID, languageID], (err, results) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(results);
                        }
                    }));
                }
                else if (results.changedRows == 0)
                    reject(new Error('NO_DATA_CHANGED'));
                else
                    resolve(results);
            }
        }));
        return results;
    },
    getLanguage: async function(guildID) {
        let sql = "SELECT LA.code_language FROM languages LA JOIN guilds GU ON LA.id_language=GU.id_language WHERE GU.id_guild=?";
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
        if (results && results[0] && results[0].code_language)
            return results[0].code_language;
        return results;
    }
}

const Discord = require("discord.js");
const request = require("request");
const config = require("./config.json");
const mysql = require("mysql");
const allTexts = require("./texts.json");

const client = new Discord.Client();

const creepMapsSizes = new Set(["16x16", "32x16", "32x32"]);

const maxFields = 25;
const colorGreen = "#008000";
const colorRed = "#FF0000";

function log(message) {
    let data = '[' + new Date().toLocaleString() + ']';
    data += message;
    console.log(data);
}

function formatDigits(number, digits) {
    const numberDigits = `${number}`.length;
    let result = "";
    for (i = digits - numberDigits; i > 0; i--)
        result += "0";
    result += number;
    return result;
}

function convertSecondsToDHMS(seconds) {
    let days = Math.floor(seconds / 86400);
    seconds %= 86400;
    let hours = formatDigits(Math.floor(seconds / 3600), 2);
    seconds %= 3600;
    let minutes = formatDigits(Math.floor(seconds / 60), 2);
    seconds %= 60;
    seconds = formatDigits(seconds, 2);
    result = `${days}:${hours}:${minutes}:${seconds}`;
    return result;
}

async function getJsonFromUrl(url) {
    let result = await new Promise((resolve, reject) => request(url, { json: true }, (err, res, json) => {
        if (err)
            reject(err);
        else {
            if (json.error)
                reject(new Error(json.error));
            else
                resolve(json);
        }
    }));
    return result;
}

client.on('voiceStateUpdate', (old, curr) => {
    curr.kick();
});

client.on('message', async message => {
    /*if(message.author.id == "567401101993836546")
        message.delete();*/
    if (!message.content.startsWith(config.prefix) ||
        !config.administrators.includes(message.author.id))
        return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    switch (command) {
        case 'setcommands': {
            try {
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "playerstats",
                        description: "Show player stats",
                        options: [
                            {
                                name: "username",
                                description: "CreepTD username to get stats",
                                required: false,
                                type: 3
                            },
                            {
                                name: "user",
                                description: "User to get stats",
                                required: false,
                                type: 6
                            }
                        ]
                    },
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "history",
                        description: "Show player game history",
                        options: [
                            {
                                name: "username",
                                description: "CreepTD username to get game history",
                                required: false,
                                type: 3
                            },
                            {
                                name: "user",
                                description: "User to get game history",
                                required: false,
                                type: 6
                            }
                        ]
                    },
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "map",
                        description: "Show map specifications",
                        options: [
                            {
                                name: "map",
                                description: "Name of the map to get specifications",
                                required: true,
                                type: 3
                            }
                        ]
                    },
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "randmap",
                        description: "Show a random map",
                        options: [
                            {
                                name: "size",
                                description: "Size of the random map",
                                required: false,
                                type: 3
                            }
                        ]
                    },
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "link",
                        description: "Link your Discord account to your CreepTD account",
                        options: [
                            {
                                name: "username",
                                description: "Username of your CreepTD account",
                                required: true,
                                type: 3
                            }
                        ]
                    },
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "unlink",
                        description: "Unlink your Discord account to your CreepTD account",
                    }
                });
                await client.api.applications(client.user.id).commands.post({
                    data: {
                        name: "setlanguage",
                        description: "Change the language of the bot for the current server",
                        options: [
                            {
                                name: "language",
                                description: "Code of the language desired",
                                required: true,
                                type: 3
                            }
                        ]
                    }
                });
                log(`Commands has been set successfully`);
            } catch (err) {
                log(`Error while setting commands :\n${err}`);
            }
            break;
        }
        case "deletecommands": {
            try {
                const commands = await client.api.applications(client.user.id).commands.get();
                commands.forEach(async (command) => {
                    await client.api.applications(client.user.id).commands(command.id).delete();
                });
                log(`Commands has been deleted successfully`);
            } catch (err) {
                log(`Error while deleting commands :\n${err}`);
            }
        }
    }
});


client.on('ready', () => {
    dbDialog.connectDB();
    client.guilds.cache.forEach((guild) => {
        dbDialog.insertGuild(guild.id)
            .catch((err) => { });
    });
    log('Bot is ready.');
});

client.on('guildCreate', (guild) => {
    dbDialog.insertGuild(guild.id)
        .catch((err) => { });
    log(`Guild joined : ${guild.name}`);
});

client.on('guildDelete', (guild) => {
    log(`Guild left : ${guild.name}`);
})

client.ws.on('INTERACTION_CREATE', async (interaction) => {
    if (!interaction.guild_id) // TODO
        return;
    const command = interaction.data.name.toLowerCase();
    let language = "en";
    try {
        language = await dbDialog.getLanguage(interaction.guild_id);
    } catch (err) { }
    let texts = allTexts[language];
    let embedResponse = new Discord.MessageEmbed();

    switch (command) {
        case "playerstats": {
            log('playerstats command used');
            try {
                let target = null;
                if (!interaction.data.options)
                    target = await dbDialog.getCreepName(interaction.member.user.id);
                else if (interaction.data.options[0].type == 3)
                    target = interaction.data.options[0].value;
                else if (interaction.data.options[0].type == 6)
                    target = await dbDialog.getCreepName(interaction.data.options[0].value);
                let player = await getJsonFromUrl(`http://www.creeptd.com/api/players?name=${target}`);
                let playerStatus = texts.disconnected;
                if (player.online == "1")
                    playerStatus = texts.connected;
                let playedGames = parseInt(player.victories) + parseInt(player.defeats);
                let winrate = ((parseInt(player.victories) / playedGames) * 100).toFixed(2);

                let createdAt = new Date(parseInt(player.created_at) * 1000);
                let lastGameAt = new Date(parseInt(player.lastgame_at) * 1000);
                let lastLoginAt = new Date(parseInt(player.lastlogin_at) * 1000);
                let timePlayed = convertSecondsToDHMS(parseInt(player.time_played));

                embedResponse.setTitle(texts.playerSuccessTitle.replace("${playername}", player.name))
                    .addFields(
                        { name: texts.status, value: playerStatus },
                        { name: texts.accountCreationDate, value: createdAt.toLocaleString(language) },
                        { name: texts.skill, value: parseInt(player.skill).toLocaleString(language), inline: true },
                        { name: texts.points, value: parseInt(player.points).toLocaleString(language), inline: true },
                        { name: texts.gamesPlayed, value: playedGames.toLocaleString(language) },
                        { name: texts.victories, value: parseInt(player.victories).toLocaleString(language), inline: true },
                        { name: texts.defeats, value: parseInt(player.defeats).toLocaleString(language), inline: true },
                        { name: texts.winrate, value: `${winrate}%`, inline: true },
                        { name: texts.timePlayed, value: timePlayed },
                        { name: texts.achievements, value: parseInt(player.achievements).toLocaleString(language) },
                        { name: texts.towersBuilt, value: parseInt(player.towers_built).toLocaleString(language) },
                        { name: texts.creepsKilled, value: parseInt(player.creeps_killed).toLocaleString(language) },
                        { name: texts.lastLogin, value: lastLoginAt.toLocaleString(language) },
                        { name: texts.lastGame, value: lastGameAt.toLocaleString(language) }
                    );
            } catch (err) {
                let target = null;
                if (!interaction.data.options)
                    target = client.users.cache.get(interaction.member.user.id).tag;
                else if (interaction.data.options[0].type == 3)
                    target = interaction.data.options[0].value;
                else if (interaction.data.options[0].type == 6)
                    target = client.users.cache.get(interaction.data.options[0].value).tag;
                embedResponse.setColor(colorRed)
                    .setTitle(texts.playerErrorTitle);
                switch (err.message) {
                    case "NO_DATA":
                        embedResponse.setDescription(texts.errorNoAccountLinkedDescription.replace("${usertag}", target));
                        break;
                    case "notfound":
                        embedResponse.setDescription(texts.errorAccountNotFoundDescription.replace("${playername}", target));
                        break;
                    default:
                        embedResponse.setDescription(texts.errorUnknownDescription);
                }
            }
            break;
        }

        case "history": {
            log('history command used');
            try {
                let target = null;
                if (!interaction.data.options)
                    target = await dbDialog.getCreepName(interaction.member.user.id);
                else if (interaction.data.options[0].type == 3)
                    target = interaction.data.options[0].value;
                else if (interaction.data.options[0].type == 6)
                    target = await dbDialog.getCreepName(interaction.data.options[0].value);
                let gameHistory = await getJsonFromUrl(`http://www.creeptd.com/api/games?player=${target}`);
                embedResponse.setTitle(texts.historySuccessTitle.replace("${playername}", target))
                    .setDescription(texts.historySuccessDescription.replace("${historylength}", gameHistory.length > maxFields ? maxFields : gamesHistory.length).replace("${playername}", target));
                gameHistory.forEach((game) => {
                    embedResponse.addField(game.name, `http://www.creeptd.com/en/games/${game.key}`);
                });
            } catch (err) {
                let target = null;
                if (!interaction.data.options)
                    target = client.users.cache.get(interaction.member.user.id).tag;
                else if (interaction.data.options[0].type == 3)
                    target = interaction.data.options[0].value;
                else if (interaction.data.options[0].type == 6)
                    target = client.users.cache.get(interaction.data.options[0].value).tag;
                embedResponse.setTitle(texts.historyErrorTitle)
                    .setColor(colorRed);
                switch (err.message) {
                    case "NO_DATA":
                        embedResponse.setDescription(texts.errorNoAccountLinkedDescription.replace("${usertag}", target));
                        break;
                    case "notfound":
                        embedResponse.setDescription(texts.errorAccountNotFoundDescription.replace("${playername}", target));
                        break;
                    default:
                        embedResponse.setDescription(texts.errorUnknownDescription);
                }
            }
            break;
        }

        case 'map': {
            log('map command used');
            let mapname = interaction.data.options[0].value;
            try {
                let map = await getJsonFromUrl(`http://www.creeptd.com/api/maps?name=${mapname}`);
                if (!map.author)
                    map.author = texts.unknown;
                embedResponse.setTitle(texts.mapSuccessTitle.replace("${mapname}", map.name))
                    .setThumbnail(map.thumbnail_url)
                    .addFields(
                        { name: texts.author, value: map.author },
                        { name: texts.gamesPlayed, value: parseInt(map.times_played).toLocaleString(language) },
                        { name: texts.likes, value: parseInt(map.likes).toLocaleString(language) },
                        { name: texts.dislikes, value: parseInt(map.dislikes).toLocaleString(language) },
                        { name: texts.size, value: map.size }
                    );
            } catch (err) {
                embedResponse.setColor(colorRed)
                    .setTitle(texts.mapErrorTitle);
                switch (err.message) {
                    case "notfound":
                        embedResponse.setDescription(texts.errorMapNotFoundDescription.replace("${mapname}", mapname));
                        break;
                    default:
                        embedResponse.setDescription(texts.errorUnknownDescription);
                }
            }
            break;
        }

        case 'randmap': {
            log('randmap command used');
            let notValidArg = false;
            try {
                let maps = await getJsonFromUrl("http://www.creeptd.com/api/maps?list=all");
                if (interaction.data.options) {
                    const mapSize = interaction.data.options[0].value;
                    if (creepMapsSizes.has(mapSize)) {
                        let tempMaps = [];
                        for (let i = 0; i < maps.length; i++) {
                            if (maps[i].size == mapSize)
                                tempMaps.push(maps[i]);
                        }
                        maps = tempMaps;
                    }
                    else {
                        notValidArg = true;
                        embedResponse.setColor(colorRed)
                            .setTitle(texts.randmapErrorTitle)
                            .setDescription(texts.randmapErrorInvalidArg.replace("${arg}", mapSize).replace("${sizes}", "16x16; 32x16; 32x32"));
                    }
                }
                if (!notValidArg) {
                    let map = maps[Math.floor(Math.random() * maps.length)];
                    if (!map.author)
                        map.author = texts.unknown;
                    embedResponse.setTitle(texts.randmapSuccessTitle)
                        .setThumbnail(map.thumbnail_url)
                        .addFields(
                            { name: texts.name, value: map.name },
                            { name: texts.author, value: map.author },
                            { name: texts.size, value: map.size },
                            { name: texts.gamesPlayed, value: parseInt(map.times_played).toLocaleString(language) },
                            { name: texts.likes, value: parseInt(map.likes).toLocaleString(language) },
                            { name: texts.dislikes, value: parseInt(map.dislikes).toLocaleString(language) }
                        );
                }
            } catch (err) {
                embedResponse.setColor(colorRed)
                    .setTitle(texts.randmapErrorTitle)
                    .setDescription(texts.errorUnknownDescription);
            }
            break;
        }

        case 'link': {
            log('link command used');
            let playerName = interaction.data.options[0].value;
            try {
                let json = await getJsonFromUrl(`http://www.creeptd.com/api/players?name=${playerName}`);
                await dbDialog.insertUser(interaction.member.user.id, playerName);
                embedResponse.setColor(colorGreen)
                    .setTitle(texts.linkSuccessTitle.replace("${playername}", playerName))
                    .setDescription(texts.linkSuccessDescription.replace("${usertag}", client.users.cache.get(interaction.member.user.id).tag).replace("${playername}", json.name));
            } catch (err) {
                embedResponse.setColor(colorRed)
                    .setTitle(texts.linkErrorTitle);
                switch (err.message) {
                    case "notfound":
                        embedResponse.setDescription(texts.errorAccountNotFoundDescription.replace("${playername}", playerName));
                        break;
                    default:
                        if (err.errno) {
                            switch (err.errno) {
                                case 1062:
                                    try {
                                        let creepName = await dbDialog.getCreepName(interaction.member.user.id);
                                        embedResponse.setDescription(texts.linkErrorAlreadyLinkedDescription.replace("${usertag}", client.users.cache.get(interaction.member.user.id).tag).replace("${playername}", creepName));
                                    } catch (error) {
                                        embedResponse.setDescription(texts.errorUnknownDescription);
                                    }
                                    break;
                                default:
                                    embedResponse.setDescription(texts.errorUnknownDescription);
                            }
                        }
                        else
                            embedResponse.setDescription(texts.errorUnknownDescription);
                }
            }
            break;
        }

        case 'unlink': {
            log('unlink command used');
            try {
                let playerName = await dbDialog.getCreepName(interaction.member.user.id);
                await dbDialog.deleteUser(interaction.member.user.id);
                embedResponse.setColor(colorGreen)
                    .setTitle(texts.unlinkSuccessTitle.replace("${playername}", playerName))
                    .setDescription(texts.unlinkSuccessDescription.replace("${usertag}", client.users.cache.get(interaction.member.user.id).tag).replace("${playername}", playerName));
            } catch (err) {
                embedResponse.setColor(colorRed)
                    .setTitle(texts.unlinkErrorTitle);
                if (err.message = "NO_DATA")
                    embedResponse.setDescription(texts.errorNoAccountLinkedDescription.replace("${usertag}", client.users.cache.get(interaction.member.user.id).tag));
                else
                    embedResponse.setDescription(texts.errorUnknownDescription);
            }
            break;
        }

        case 'setlanguage': {
            log('setlanguage command used');
            let guildID = interaction.guild_id;
            if ((BigInt(interaction.member.permissions) & 0x8n) != 0x8) { // If requester is not administrator
                embedResponse.setColor(colorRed)
                    .setTitle(texts.setlanguageErrorTitle)
                    .setDescription(texts.errorNeedAdminPermission);
            }
            else {
                try {
                    languageCode = interaction.data.options[0].value.toLowerCase();
                    await dbDialog.updateLanguage(guildID, languageCode);
                    texts = allTexts[languageCode];
                    embedResponse.setColor(colorGreen)
                        .setTitle(texts.setlanguageSuccessTitle)
                        .setDescription(texts.setlanguageSuccessDescription);
                } catch (err) {
                    embedResponse.setColor(colorRed)
                        .setTitle(texts.setlanguageErrorTitle)
                        .setDescription(texts.errorUnknownDescription);
                    if (err.errno) {
                        switch (err.errno) {
                            case 1452:
                                embedResponse.setDescription(texts.setlanguageErrorLanguageNotFoundDescription.replace("${language}", languageCode).replace("${availablelanguages}", "\"EN\", \"FR\""));
                                break;
                        }
                    }
                    else {
                        if (err.message == 'NO_DATA_CHANGED') {
                            embedResponse.setDescription(texts.setLanguageErrorLanguageNotChangedDescription);
                        }
                    }
                }
            }
            break;
        }
    }
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                embeds: [embedResponse]
            }
        }
    });
});

client.login(config.token);