const log = require("../utils/log");
const getJsonFromUrl = require('../utils/getJsonFromUrl');
const dbDialog = require('../utils/dbDialog');
const { colorGreen, colorRed } = require('../utils/data');
const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports.use = async (interaction, embedResponse, texts) => {
    if (!(interaction instanceof CommandInteraction && embedResponse instanceof MessageEmbed)) throw new Error('Variable type error');

    log('link command used');

    const playerName = interaction.options.getString('username');
    try {
        let json = await getJsonFromUrl(`http://www.creeptd.com/api/players?name=${playerName}`);
        await dbDialog.insertUser(interaction.member.user.id, playerName);
        embedResponse.setColor(colorGreen)
            .setTitle(texts.linkSuccessTitle.replace("${playername}", playerName))
            .setDescription(texts.linkSuccessDescription.replace("${usertag}", interaction.member.user.tag).replace("${playername}", json.name));
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
                                embedResponse.setDescription(texts.linkErrorAlreadyLinkedDescription.replace("${usertag}", interaction.member.user.tag).replace("${playername}", creepName));
                            } catch (error) {
                                embedResponse.setDescription(texts.errorUnknownDescription);
                            }
                            break;
                        default:
                            console.log(err);
                            embedResponse.setDescription(texts.errorUnknownDescription);
                    }
                }
                else {
                    console.log(err);
                    embedResponse.setDescription(texts.errorUnknownDescription);
                }
        }
    }
    return embedResponse;
}