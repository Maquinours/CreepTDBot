const Discord = require("discord.js");
const config = require("./config.json");
const log = require('./utils/log');

const client = new Discord.Client({intents: "GUILDS"});


client.on('ready', async () => {
    await require('./events/ready').use();
});

client.on('guildCreate', (guild) => {
    require('./events/guild_create').use(guild);
});

client.on('guildDelete', (guild) => {
    require('./events/guild_delete').use(guild);
})

client.on('interactionCreate', (interaction) => {
    require('./events/interaction_create').use(interaction);
});

client.login(config.token);