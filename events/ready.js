const dbDialog = require("../utils/dbDialog");
const log = require("../utils/log");

module.exports.use = async () => {
    await dbDialog.connectDB();
    log('Bot is ready.');
}