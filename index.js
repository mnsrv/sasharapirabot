var TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var SLACK_TOKEN = process.env.SLACK_TOKEN;
var LASTFM_API_KEY = process.env.LASTFM_API_KEY;

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

var sendMusicToSlack = function(url, music) {
    request({
        uri: url,
        method: 'POST',
        json: {
            'response_type': 'ephemeral',
            'text': music
        }
    });
};

var checkMusicFromUser = function(user, callback) {
    var lastfmOptions = {
        url: 'http://ws.audioscrobbler.com/2.0/',
        qs: {
            method: 'user.getrecenttracks',
            user: user,
            api_key: LASTFM_API_KEY,
            format: 'json'
        },
        method: 'GET'
    };

    request(lastfmOptions, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var track = info.recenttracks.track[0];
            if (track['@attr'] && track['@attr'].nowplaying) {
                var artist = track.artist['#text'];
                var name = track.name;
                var music = artist + ' – ' + name;
                callback(music);
            }
        }
    });
};

app.post('/slack', function(req, res) {
    var url = req.body.response_url;
    var token = req.body.token;
    var slackCallback = function(music) {
        sendMusicToSlack(url, music);
    };
    if(token === SLACK_TOKEN) {
        res.status(200).send();
        checkMusicFromUser('Gidross', slackCallback);
    } else {
        console.log('Incorrect token.');
        res.end();
    }
});

// Matches /music
bot.onText(/\/music/, function (msg) {
    var chatId = msg.chat.id;
    var telegramCallback = function(music) {
        bot.sendMessage(chatId, music);
    };
    checkMusicFromUser('Gidross', telegramCallback);
});
