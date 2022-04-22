const { colorGreen, colorRed } = require("../utils/data");
const dbDialog = require("../utils/dbDialog");
const log = require("../utils/log");

module.exports.use = async (interaction, embedResponse, texts) => {
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
        else
            embedResponse.setDescription(texts.errorUnknownDescription);
    }
    return embedResponse;
}