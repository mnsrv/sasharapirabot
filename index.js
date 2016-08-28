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
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

require('./commands/music')(app, bot);
require('./commands/instapaper')(bot);