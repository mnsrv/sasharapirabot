module.exports = function(bot, analytics) {
    // Alfred
    var Instapaper = require('instapaper');
    var CONSUMER_KEY = process.env.CONSUMER_KEY;
    var CONSUMER_SECRET = process.env.CONSUMER_SECRET;
    var USERNAME = process.env.USERNAME;
    var PASSWORD = process.env.PASSWORD;
    var CHAT_ID = process.env.CHAT_ID;
    var randomText = "Покажи случайную статью";
    var randomRegExp = new RegExp('\/random|' + randomText);
    var countText = "Сколько статей в списке?";
    var countRegExp = new RegExp('\/count|' + countText);
    var archiveCallbackData = 'archive';
    var deleteCallbackData = 'delete';

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

  var keyboardOptions = {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [{ text: randomText }],
        [{ text: countText }]
      ]
    }
  };
  var inlineOptions = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{text: "В архив", callback_data: archiveCallbackData }],
        [{text: "Удалить", callback_data: deleteCallbackData }]
      ]
    }
  };
      var sendCount = function(msg) {
        var fromId = msg.from.id;
        var chatId = msg.chat.id;
        analytics(msg, 'count');
        // Load a list of bookmarks using promises...
        client.bookmarks.list({limit: 500}).then(function(bookmarks) {
            // remove meta and user info
            bookmarks.shift();
            bookmarks.shift();
            var count = bookmarks.length;
            var stateWord = getNumEnding(count, ['статья', 'статьи', 'статей']);
            bot.sendMessage(chatId, 'у вас *' + count + '* ' + stateWord, keyboardOptions);
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
      };
      var sendRandomArticle = function(msg) {
        console.log('showing random article...');
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
            bot.sendMessage(chatId, '*случайная статья №' + randomNumber + ':*\n' + randomState, inlineOptions);
        }).catch(function(err) {
            console.warn('oh noes', err);
            bot.sendMessage(chatId, 'ошибка :c');
        });
      };
      var archiveArticle = function (msg, regexp, isCallbackQuery) {
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
            if (isCallbackQuery) {
              bot.answerCallbackQuery(archiveCallbackData, 'Статья перенесена в архив', true);
            }
            bot.sendMessage(chatId, 'статья перенесена в архив', keyboardOptions);
        }).catch(function(err) {
            console.warn('oh noes', err);
            if (isCallbackQuery) {
              bot.answerCallbackQuery(archiveCallbackData);
            }
            bot.sendMessage(chatId, 'ошибка :c');
        });
      };
      var deleteArticle = function (msg, regexp, isCallbackQuery) {
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
          if (isCallbackQuery) {
            bot.answerCallbackQuery(deleteCallbackData, 'Статья удалена', true);
          }
            bot.sendMessage(chatId, 'статья удалена', keyboardOptions);
        }).catch(function(err) {
            console.warn('oh noes', err);
          if (isCallbackQuery) {
            bot.answerCallbackQuery(deleteCallbackData);
          }
            bot.sendMessage(chatId, 'ошибка :c');
        });
      };

  bot.on('callback_query', function(msg) {
    var user = msg.from.id;
    var message = msg.message;
    var data = msg.data;
    if (data === 'archive') {
      archiveArticle(message, null, true);
    } else if (data === 'delete') {
      deleteArticle(message, null, true);
    }
  });
  bot.onText(countRegExp, sendCount);
  bot.onText(randomRegExp, sendRandomArticle);
  bot.onText(/\/archive/, archiveArticle);
  bot.onText(/\/delete/, deleteArticle);
};
