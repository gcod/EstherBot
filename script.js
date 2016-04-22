'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },
    start: {
        receive: (bot) => {
            return bot.say('On se présente:')
                .then(() => 'askName');
        }
    },
    askName: {
        prompt: (bot) => bot.say('Je suis YPGab. Et toi, quel est ton nom?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Super! Je vais t\'appeler ${name}`))
                .then(() => 'askCity');
        }
    },
    askCity: {
        prompt: (bot) => bot.say('Dans quelle ville es-tu?'),
        receive: (bot, message) => {
            const city = message.text;
            return bot.setProp('city', city)
                .then(() => bot.say(`${city}, quelle belle ville!`))
                .then(() => bot.say(`Quel type d\'entreprise cherches-tu? (Ex: AUTOMOBILE, MAISON, RESTAURANT, SANTÉ, HOTEL)`))
                .then(() => 'speak');
        }
    },
    //question: {
    //    receive: (bot) => {
    //        return bot.say('Quel type d\'entreprise cherches-tu? (Ex: AUTOMOBILE, MAISON, RESTAURANT, SANTÉ, HOTEL) ')
    //            .then(() => 'speak');
    //    }
    //},
    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`Désolé, je ne comprends pas.`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split(/(<img src=\'[^>]*\'\/>)/);

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    if (!line.startsWith("<")) {
                        p = p.then(function() {
                            return bot.say(line);
                        });
                    } else {
                        // p = p.then(function() {
                        //     var start = line.indexOf("'") + 1;
                        //     var end = line.lastIndexOf("'");
                        //     var imageFile = line.substring(start, end);
                        //     return bot.sendImage(imageFile);
                        // });
                    }
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
