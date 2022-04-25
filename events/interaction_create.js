const { MessageEmbed, CommandInteraction } = require("discord.js");

const allTexts = require("../utils/texts.json");
const dbDialog = require("../utils/dbDialog");

module.exports.use = async (interaction) => {
    if (!(interaction instanceof CommandInteraction)) return;
    if (!interaction.guildId)
        return;
    const command = interaction.commandName;
    let language = "EN";
    try {
        language = await dbDialog.getLanguage(interaction.guildId);
    } catch (err) {
        if (err.message === 'NO_DATA')
            dbDialog.insertGuild(interaction.guildId);
        else
            throw err;
    }
    let texts = allTexts[language];
    let embedResponse = new MessageEmbed();

    switch (command) {
        case "playerstats": {
            embedResponse = await require('../commands/playerstats').use(interaction, embedResponse, texts, language);
            break;
        }

        case "history": {
            embedResponse = await require('../commands/history').use(interaction, embedResponse, texts);
            break;
        }

        case 'map': {
            embedResponse = await require('../commands/map').use(interaction, embedResponse, texts, language);
            break;
        }

        case 'randmap': {
            embedResponse = await require('../commands/randmap').use(interaction, embedResponse, texts, language);
            break;
        }

        case 'link': {
            embedResponse = await require('../commands/link').use(interaction, embedResponse, texts);
            break;
        }

        case 'unlink': {
            embedResponse = await require('../commands/unlink').use(interaction, embedResponse, texts);
            break;
        }

        case 'setlanguage': {
            embedResponse = await require('../commands/setlanguage').use(interaction, embedResponse, texts, allTexts);
            break;
        }
    }
    interaction.reply({ embeds: [embedResponse] });
}