var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var LASTFM_API_KEY = process.env.LASTFM_API_KEY;

var bot = new TelegramBot(TOKEN, {polling: true});

console.log('hello');

bot.onText(/(music vk|музыка вк|vk music|vk)/, function (msg) {
    var chatId = msg.chat.id;
    var text = 'сейчас не играет никакая музыка';
    request('https://api.vk.com/method/users.get?user_ids=7149276&fields=status', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var vk_response = info.response[0];
            if (vk_response.status_audio) {
                text = 'сейчас играет: ';
                text = text + vk_response.status_audio.artist + ' – ' + vk_response.status_audio.title;
            }
            bot.sendMessage(chatId, text);
        }
    });
});

bot.onText(/(music spotify|музыка спотифай|спотифай|spotify music|spotify|шо за трек|шозатрек)/, function(msg) {
    var chatId = msg.chat.id;
    var text = 'сейчас не играет никакая музыка';
    request(
        {
            url: 'http://ws.audioscrobbler.com/2.0/',
            qs: {
                method: 'user.getrecenttracks',
                user: 'iamseventeen',
                api_key: LASTFM_API_KEY,
                format: 'json'
            },
            method: 'GET'
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                var track = info.recenttracks.track[0];
                var artist = track.artist['#text'];
                var name = track.name;

                if (artist.match(/bieber/i)){
                    var output = '🎧Сейчас играет хуета';
                } else {
                    var output = '🎧Сейчас играет: ' + artist + ' – ' + name;
                }
                bot.sendMessage(chatId, output);
            }
        }
    );
});
