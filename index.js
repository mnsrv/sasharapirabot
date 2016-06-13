var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

app.post('/slack', function(req, res) {
    console.log('hello from slack');
    console.log(req.body.user_name);
});

var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var LASTFM_API_KEY = process.env.LASTFM_API_KEY;

var bot = new TelegramBot(TOKEN, {polling: true});

console.log('hello');
var available;

function setRequest(user, displayName, chatId) {
    request(
        {
            url: 'http://ws.audioscrobbler.com/2.0/',
            qs: {
                method: 'user.getrecenttracks',
                user: user,
                api_key: LASTFM_API_KEY,
                format: 'json'
            },
            method: 'GET'
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(available);
                var info = JSON.parse(body);
                var track = info.recenttracks.track[0];
                var text = user + ' 💤';
                if (track['@attr'] && track['@attr'].nowplaying) {
                    var artist = track.artist['#text'];
                    var name = track.name;
                    text = displayName + ' 🔊 ' + artist + ' – ' + name;
                    if (!available) {
                        // первый трек есть
                        available = 1;
                    }
                    bot.sendMessage(chatId, text);
                } else {
                    if (available) {
                        // второго трека нет
                        if (available == -1) {
                            // первого трека тоже нет
                            bot.sendMessage(chatId, 'Никто ничего не слушает');
                        }
                    } else {
                        // первого трека нет
                        available = -1;
                    }
                }
            }
        }
    );
}

// Matches /music
bot.onText(/\/music/, function (msg) {
    var chatId = msg.chat.id;
    console.log(msg.from);
    available = 0;
    setRequest('iamseventeen', 'Диман', chatId);
    setRequest('Gidross', 'Саша', chatId);
});