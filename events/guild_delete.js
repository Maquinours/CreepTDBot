const { Guild } = require("discord.js");

const log = require("../utils/log");

module.exports.use = (guild) => {
    if (!(guild instanceof Guild)) throw new Error('Variable type error');

    log(`Guild left : ${guild.name}`);
}