const log = require("../utils/log");
const dbDialog = require('../utils/dbDialog');
const { colorGreen, colorRed } = require('../utils/data');
const { Interaction, MessageEmbed } = require("discord.js");

module.exports.use = async (interaction, embedResponse, texts, allTexts) => {
    if (interaction instanceof Interaction && embedResponse instanceof MessageEmbed && typeof (texts) == 'object') {
        log('setlanguage command used');
        if ((BigInt(interaction.member.permissions) & 0x8n) != 0x8) { // If requester is not administrator
            embedResponse.setColor(colorRed)
                .setTitle(texts.setlanguageErrorTitle)
                .setDescription(texts.errorNeedAdminPermission);
        }
        else {
            try {
                languageCode = interaction.options.getString('language').toUpperCase();
                if (typeof(allTexts[languageCode]) == 'undefined') {
                    embedResponse.setColor(colorRed)
                        .setTitle(texts.setlanguageErrorTitle)
                        .setDescription(texts.setlanguageErrorLanguageNotFoundDescription.replace("${language}", languageCode).replace("${availablelanguages}", "\"EN\", \"FR\""));
                }
                else {
                    await dbDialog.updateLanguage(interaction.guildId, languageCode);
                    texts = allTexts[languageCode];
                    embedResponse.setColor(colorGreen)
                        .setTitle(texts.setlanguageSuccessTitle)
                        .setDescription(texts.setlanguageSuccessDescription);
                }
            } catch (err) {
                embedResponse.setColor(colorRed)
                    .setTitle(texts.setlanguageErrorTitle)
                    .setDescription(texts.errorUnknownDescription);
                if (err.message === 'NO_DATA_CHANGED') {
                    embedResponse.setDescription(texts.setLanguageErrorLanguageNotChangedDescription);
                }
            }
        }
        return embedResponse;
    }
}