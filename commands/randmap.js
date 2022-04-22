const log = require("../utils/log");
const getJsonFromUrl = require('../utils/getJsonFromUrl');
const { colorRed, creepMapsSizes, colorGreen } = require('../utils/data');


module.exports.use = async (interaction, embedResponse, texts, language) => {
    log('randmap command used');
    let notValidArg = false;
    try {
        let maps = await getJsonFromUrl("http://www.creeptd.com/api/maps?list=all");
        let mapSize = null;
        if (mapSize = interaction.options.getString('size')) {
            if (creepMapsSizes.has(mapSize)) {
                for (let i = 0; i < maps.length; i++) {
                    if (maps[i].size != mapSize) {
                        maps.splice(i, 1);
                        i--;
                    }
                }
            }
            else {
                notValidArg = true;
                embedResponse.setColor(colorRed)
                    .setTitle(texts.randmapErrorTitle)
                    .setDescription(texts.randmapErrorInvalidArg.replace("${arg}", mapSize).replace("${sizes}", "16x16; 32x16; 32x32"));
            }
        }
        if (!notValidArg) {
            const map = maps[Math.floor(Math.random() * maps.length)];
            if (!map.author)
                map.author = texts.unknown;
            embedResponse.setColor(colorGreen)
                .setTitle(texts.randmapSuccessTitle)
                .setThumbnail(map.thumbnail_url)
                .addFields(
                    { name: texts.name, value: map.name },
                    { name: texts.author, value: map.author },
                    { name: texts.size, value: map.size },
                    { name: texts.gamesPlayed, value: parseInt(map.times_played).toLocaleString(language) },
                    { name: texts.likes, value: parseInt(map.likes).toLocaleString(language) },
                    { name: texts.dislikes, value: parseInt(map.dislikes).toLocaleString(language) }
                );
        }
    } catch (err) {
        console.log(err);
        embedResponse.setColor(colorRed)
            .setTitle(texts.randmapErrorTitle)
            .setDescription(texts.errorUnknownDescription);
    }
    return embedResponse;
}