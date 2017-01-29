module.exports = function(bot, analytics) {
    // Alfred
    var Instapaper = require('instapaper');
    var CONSUMER_KEY = process.env.CONSUMER_KEY;
    var CONSUMER_SECRET = process.env.CONSUMER_SECRET;
    var USERNAME = process.env.USERNAME;
    var PASSWORD = process.env.PASSWORD;
    
    var CHAT_ID = process.env.CHAT_ID;

    var BOOKMARKID = 0;

    var client = Instapaper(CONSUMER_KEY, CONSUMER_SECRET);
    client.setUserCredentials(USERNAME, PASSWORD);

    /**
     * Функция возвращает окончание для множественного числа слова на основании числа и массива окончаний
     * param  iNumber Integer Число на основе которого нужно сформировать окончание
     * param  aEndings Array Массив слов или окончаний для чисел (1, 4, 5),
     *         например ['яблоко', 'яблока', 'яблок']
     * return String
     */
    function getNumEnding(iNumber, aEndings) {
        var sEnding, i;
        iNumber = iNumber % 100;
        if (iNumber>=11 && iNumber<=19) {
            sEnding=aEndings[2];
        }
        else {
            i = iNumber % 10;
            switch (i)
            {
                case (1): sEnding = aEndings[0]; break;
                case (2):
                case (3):
                case (4): sEnding = aEndings[1]; break;
                default: sEnding = aEndings[2];
            }
        }
        return sEnding;
    }

    /**
     * Функция возвращает случайное целое число между min (включительно) и max (не включая max).
     * Использование метода Math.round() даст вам неравномерное распределение!
     * param min Integer Минимальное число (включительно)
     * param max Integer Максимальное число (не включительно)
     * return Int
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    bot.onText(/\/count/, function(msg) {
        var fromId = msg.from.id;
        var chatId = msg.chat.id;
        analytics(msg, 'count');
        // Load a list of bookmarks using promises...
        client.bookmarks.list({limit: 500}).then(function(bookmarks) {
            // remove meta and user info
            bookmarks.shift();
            bookmarks.shift();
            var count = bookmarks.length;
            bot.sendMessage(chatId, 'у вас ' + count + ' ' + stateWord);
            var stateWord = getNumEnding(count, ['статья', 'статьи', 'статей']);
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
    });

    bot.onText(/\/random/, function(msg) {
        var fromId = msg.from.id;
        var chatId = msg.chat.id;
        analytics(msg, 'random');
        // Load a list of bookmarks using promises...
        client.bookmarks.list({limit: 500}).then(function(bookmarks) {
            // remove meta and user info
            bookmarks.shift();
            bookmarks.shift();
            var count = bookmarks.length;
            var randomNumber = getRandomInt(0, count);
            var randomState = bookmarks[randomNumber].url;
            BOOKMARKID = bookmarks[randomNumber].bookmark_id;
            bot.sendMessage(chatId, 'случайная статья №' + randomNumber + ':\n' +
                randomState
            );
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
    });

    bot.onText(/\/archive/, function (msg) {
        var fromId = msg.from.id;
        var chatId = msg.chat.id;
        analytics(msg, 'archive');
        if (chatId != CHAT_ID) {
            bot.sendMessage(chatId, 'отказано в доступе');
            return false;
        }
        if (!BOOKMARKID) {
            bot.sendMessage(chatId, 'не выбрана статья');
            return false;
        }
        // Moves the specified bookmark to the Archive.
        // Input parameter: bookmark_id
        // Output: The modified bookmark on success.
        client.bookmarks.archive(BOOKMARKID).then(function(bookmark) {
            // remove meta and user info
            BOOKMARKID = false;
            bot.sendMessage(chatId, 'статья перенесена в архив');
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
    });

    bot.onText(/\/delete/, function (msg) {
        var fromId = msg.from.id;
        var chatId = msg.chat.id;
        analytics(msg, 'delete');
        if (chatId != CHAT_ID) {
            bot.sendMessage(chatId, 'отказано в доступе');
            return false;
        }
        if (!BOOKMARKID) {
            bot.sendMessage(chatId, 'не выбрана статья');
            return false;
        }
        // Permanently deletes the specified bookmark. This is NOT the same as Archive. Please be clear to users if you're going to do this.
        // Input parameter: bookmark_id
        // Output: An empty array on success.
        client.bookmarks.delete(BOOKMARKID).then(function() {
            // remove meta and user info
            BOOKMARKID = false;
            bot.sendMessage(chatId, 'статья удалена');
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
    });
};