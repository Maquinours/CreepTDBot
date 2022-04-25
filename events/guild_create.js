const { Guild } = require("discord.js");

const dbDialog = require("../utils/dbDialog");
const log = require("../utils/log");

module.exports.use = (guild) => {
    if (!(guild instanceof Guild)) throw new Error('Variable type error');

    dbDialog.insertGuild(guild.id)
        .catch((err) => { });
    log(`Guild joined : ${guild.name}`);
}