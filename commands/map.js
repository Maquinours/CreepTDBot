const log = require("../utils/log");
const getJsonFromUrl = require('../utils/getJsonFromUrl');
const { colorRed, colorGreen } = require('../utils/data');
const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports.use = async (interaction, embedResponse, texts, language) => {
    if(!(interaction instanceof CommandInteraction && embedResponse instanceof MessageEmbed)) throw new Error('Variable type error');

    log('map command used');

    const mapname = interaction.options.getString('map');
    try {
        const map = await getJsonFromUrl(`http://www.creeptd.com/api/maps?name=${mapname}`);
        if (!map.author)
            map.author = texts.unknown;
        embedResponse.setColor(colorGreen)
            .setTitle(texts.mapSuccessTitle.replace("${mapname}", map.name))
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
                console.log(err);
                embedResponse.setDescription(texts.errorUnknownDescription);
        }
    }
    return embedResponse;
}