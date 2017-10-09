
var Botkit = require('botkit');
//var childProcess = require("child_process");

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.SLACK_TOKEN,
}).startRTM()

// give the bot something to listen for.
//controller.hears('string or regex',['direct_message','direct_mention','mention'],function(bot,message) {
controller.hears('[\s\S]*',['mention', 'direct_mention','direct_message'], function(bot,message) 
{
  console.log(message);
  bot.reply(message, message.text);
});

/**
 * Selenium testing for presence of bot
 * TODO: pull out all selenium tests into their own module
 */
controller.hears('hello world, from Selenium',['mention', 'direct_mention','direct_message', 'ambient'], function(bot,message) 
{
  console.log(message);
  bot.reply(message, message.text);
});
