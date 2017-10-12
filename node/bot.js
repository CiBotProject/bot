
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
/*controller.hears('[\s\S]*',['mention', 'direct_mention','direct_message'], function(bot,message)
{
  console.log(message);
  bot.reply(message, message.text);
});
*/
controller.hears(['yaml','generate yaml','init project'],['direct_message','direct_mention','mention'],function(bot,message){
  //start conversation with one user, replies from other users should not affect this conversation
  //TODO: test this functionality by letting a different user reply, expected outcome should be no reply from bot to that user
  bot.startConversation(message,function(err,convo){
    convo.addQuestion('Which language do you want to use? ( Javascript with NodeJS, Ruby or Python)',function(response,convo){

      if(response.text.toLowerCase().includes("node")){
        //TODO:store environment in the database
        convo.say("Great, give me a minute to setup the configuration file! I'll let you know when it's done..");
        convo.next();
        
        //to simulate the delay in response for creating config file
        setTimeout(function(){
          bot.reply(message,"Done");
        },10000);

      }
      else{
        convo.say("Sorry, I am not smart enough to create that config :disappointed:");
        convo.next();
      }
    });
  });
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
