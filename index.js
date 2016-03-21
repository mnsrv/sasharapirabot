var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Setup polling way
var bot = new TelegramBot(TOKEN, {polling: true});

// Any kind of message
bot.onText(/(music|музыка)/, function (msg) {
    var fromId = msg.from.id;
    var text = 'сейчас не играет никакая музыка';
    request('https://api.vk.com/method/users.get?user_ids=7149276&fields=status', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var vk_response = info.response[0];
            if (vk_response.status_audio) {
                text = 'сейчас играет: ';
                text = text + vk_response.status_audio.artist + ' – ' + vk_response.status_audio.title;
            }
            bot.sendMessage(fromId, text);
        }
    });
});