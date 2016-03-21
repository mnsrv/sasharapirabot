var TelegramBot = require('node-telegram-bot-api');

var TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Setup polling way
var bot = new TelegramBot(TOKEN, {polling: true});

// Any kind of message
bot.on('message', function (msg) {
    var fromId = msg.from.id;
    var text = 'hello world';
    bot.sendMessage(fromId, text);
});