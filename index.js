'use strict';

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

var TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var BOTANIO_TOKEN = process.env.BOTANIO_TOKEN;
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});
var botan = require('botanio')(BOTANIO_TOKEN);
var analytics = function(userMessage, event) {
    botan.track(userMessage, event);
};

require('./commands/music')(app, bot, analytics);
require('./commands/instapaper')(bot, analytics);
