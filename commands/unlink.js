const { CommandInteraction, MessageEmbed } = require("discord.js");
const { colorGreen, colorRed } = require("../utils/data");
const dbDialog = require("../utils/dbDialog");
const log = require("../utils/log");

module.exports.use = async (interaction, embedResponse, texts) => {
    if(!(interaction instanceof CommandInteraction && embedResponse instanceof MessageEmbed)) throw new Error('Variable type error');

    log('unlink command used');
    try {
        let playerName = await dbDialog.getCreepName(interaction.member.user.id);
        await dbDialog.deleteUser(interaction.member.user.id);
        embedResponse.setColor(colorGreen)
            .setTitle(texts.unlinkSuccessTitle.replace("${playername}", playerName))
            .setDescription(texts.unlinkSuccessDescription.replace("${usertag}", interaction.member.user.tag).replace("${playername}", playerName));
    } catch (err) {
        embedResponse.setColor(colorRed)
            .setTitle(texts.unlinkErrorTitle);
        if (err.message = "NO_DATA")
            embedResponse.setDescription(texts.errorNoAccountLinkedDescription.replace("${usertag}", interaction.member.user.tag));
        else {
            console.log(err);
            embedResponse.setDescription(texts.errorUnknownDescription);
        }
    }
    return embedResponse;
}