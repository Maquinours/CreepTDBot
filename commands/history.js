const { CommandInteraction, MessageEmbed } = require("discord.js");
const dbDialog = require('../utils/dbDialog');
const getJsonFromUrl = require('../utils/getJsonFromUrl');
const log = require("../utils/log");
const { colorRed, maxFields, colorGreen } = require('../utils/data');

module.exports.use = async (interaction, embedResponse, texts) => {
    if (!(interaction instanceof CommandInteraction && embedResponse instanceof MessageEmbed)) throw new Error('Variable type error');

    log('history command used');

    try {
        let target = null;
        let tempTarget = null;

        if (target = interaction.options.getString('username')) { }
        else if (tempTarget = interaction.options.getMember('user')) target = await dbDialog.getCreepName(tempTarget.user.id);
        else target = await dbDialog.getCreepName(interaction.member.user.id);

        let gameHistory = await getJsonFromUrl(`http://www.creeptd.com/api/games?player=${target}`);
        embedResponse.setColor(colorGreen)
            .setTitle(texts.historySuccessTitle.replace("${playername}", target))
            .setDescription(texts.historySuccessDescription.replace("${historylength}", gameHistory.length > maxFields ? maxFields : gameHistory.length).replace("${playername}", target));
        gameHistory.forEach((game) => {
            embedResponse.addField(game.name, `http://www.creeptd.com/en/games/${game.key}`);
        });
    } catch (err) {
        let target = interaction.user.tag;
        let temp = null;
        if (temp = interaction.options.getMember('user'))
            target = temp.user.tag;
        else if (temp = interaction.options.getString('username'))
            target = temp;
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
                console.log(err);
                embedResponse.setDescription(texts.errorUnknownDescription);
        }
    }

    return embedResponse;
}