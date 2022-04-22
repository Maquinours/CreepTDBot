const log = require("../utils/log");
const { colorGreen, colorRed } = require('../utils/data');
const dbDialog = require('../utils/dbDialog');
const getJsonFromUrl = require('../utils/getJsonFromUrl');
const convertSecondsToDHMS = require('../utils/convertSecondsToDHMS');

module.exports.use = async (interaction, embedResponse, texts, language) => {
    log('playerstats command used');
    try {
        let target = null;
        let tempTarget = null;
        if (target = interaction.options.getString('username')) { }
        else if (tempTarget = interaction.options.getMember('user')) target = await dbDialog.getCreepName(tempTarget.user.id);
        else target = await dbDialog.getCreepName(interaction.member.user.id);

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

        embedResponse.setColor(colorGreen)
            .setTitle(texts.playerSuccessTitle.replace("${playername}", player.name))
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
        let target = interaction.user.tag;
        let temp = null;
        if (temp = interaction.options.getMember('user'))
            target = temp.user.tag;
        else if (temp = interaction.options.getString('username'))
            target = temp;
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
    return embedResponse;
}