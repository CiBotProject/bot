
var Botkit = require('botkit');
//var childProcess = require("child_process");

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

var repoName = null;
var coverageThreshold = 0;

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.SLACK_TOKEN,
}).startRTM()

//init repository
controller.hears(['init'],['direct_message','direct_mention','mention'],function(bot,message){
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('init');
  if(messageArray.indexOf('help')===-1){
    //repo name has to be word after init
    if((index+1)<messageArray.length)
        repoName = messageArray[index+1];
    //if repo name is provided
    if(repoName!==null){
      bot.startConversation(message,function(err,convo){
        convo.say("I am initializing the repository...");
        convo.ask('Would you like to create a yaml file as well?',[
          {
            pattern:bot.utterances.yes,
            callback:function(response,convo){
              convo.next();
              convo.ask('Which language do you want to use? ( Javascript with NodeJS, Ruby or Python)',function(response,convo){
                if(response.text.toLowerCase().includes("node")){
                  //TODO:store environment in the database
                  convo.say("Great, give me a minute to setup the configuration! I'll let you know when it's done..");
                  convo.next();
                  //to simulate the delay in response for creating config file
                  initializeRepository(bot,message,repoName,"node");
                }
                else{
                  convo.say("Sorry, I am not smart enough to create that config :disappointed:");
                  convo.next();
                }
              });
            }
          },
          {
            pattern:bot.utterances.no,
            callback:function(response,convo){
              convo.say("Alright, continuing with initialization");
              initializeRepository(bot,message,repoName);
              convo.next();
            }
          },
          {
            default:true,
            callback:function(response,convo){
              convo.repeat();
              convo.next();
            }
          }
        ],{},'default');
      });
    }
    else{
      bot.reply(message,"Please provide the name of the repository to be initialized. Ex init <repository>");
    }
  }
  else{
    bot.reply(message,helpCommands().init);
  }
});
//configure yaml
controller.hears(['configure'],['direct_message','direct_mention','mention'],function(bot,message){
  //start conversation with one user, replies from other users should not affect this conversation
  //TODO: test this functionality by letting a different user reply, expected outcome should be no reply from bot to that user
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('configure');
  if(messageArray.indexOf('help')===-1){
    //repo name has to be word after init
    if((index+1)<messageArray.length)
        repoName = messageArray[index+1];

    if(repoName!=null)
      bot.startConversation(message,function(err,convo){
        convo.ask('Which language do you want to use? ( Javascript with NodeJS, Ruby or Python)',function(response,convo){

          if(response.text.toLowerCase().includes("node")){
            //TODO:store environment in the database
            convo.say("Great, give me a minute to setup the configuration file! I'll let you know when it's done..");
            convo.next();
            initializeRepository(bot,message,repoName,"node");

          }
          else{
            convo.say("Sorry, I am not smart enough to create that config :disappointed:");
            convo.next();
          }
        });
      });
    }
    else{
      bot.reply(message,helpCommands().configure);
    }
});
//testing issue creation
controller.hears(['test issue'],['direct_message','direct_mention','mention'],function(bot,message){
  bot.startConversation(message,function(err,convo){
    convo.ask('Please enter the title of the issue',function(response,convo){
      if(response!==null && response.text!==""){
          convo.setVar('issueName',response.text);
          convo.next();
      }else{
        convo.repeat();
        convo.next();
      }
    });

    convo.ask('Please enter a comma-separated list of assignees to the issue. Ex @user1,@user2,@user3...',function(response,convo){
      if(response!==null && response.text!==""){
        var assigneeList = response.text.split(',');
        convo.setVar('assigneeList',assigneeList);
        convo.next();
        var listOutput = response.text;
        convo.say("I am going to create an issue titled '{{vars.issueName}}' and assign it to "+listOutput);

      }else{
        convo.repeat();
        convo.next();
      }
    });
  });
});
//testing Travis
controller.hears(['test travis','test Travis'],['direct_message','direct_mention','mention'],function(bot,message){
  bot.reply(message,"Testing travis");
});

//testing Coveralls
controller.hears(['test coveralls','test Coveralls'],['direct_message','direct_mention','mention'],function(bot,message){
  bot.reply(message,"Testing coveralls");
});

//testing Coveralls
controller.hears(['set coverage threshold','set threshold'],['direct_message','direct_mention','mention'],function(bot,message){
  //TODO add bounds between 0 - 100 as it is percentage
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('to');

  //repo name has to be word after init
  if((index+1)<messageArray.length){
      coverageThreshold = parseInt(messageArray[index+1]);
      bot.reply(message,"The coverage threshold has been set to "+coverageThreshold);
  }
  else{
      bot.reply(message,"Please provide the coverage threshold. Ex set coverage threshold to <number>");
  }
});

controller.hears(['help'],['direct_message','direct_mention','mention'],function(bot,message){
  var messageArray = message.text.split(' ');

  if(messageArray.indexOf('init')!==-1){
      bot.reply(message,helpCommands().init);
  }
  else if(messageArray.indexOf('configure')!==-1){
    bot.reply(message,helpCommands().configure);
  }
  else if(messageArray.indexOf('issue')!==-1){
    bot.reply(message,helpCommands().issue);
  }
  else if(messageArray.indexOf('travis')!==-1){
    bot.reply(message,helpCommands().travis);
  }
  else if(messageArray.indexOf('coveralls')!==-1){
    bot.reply(message,helpCommands().coveralls);
  }
  else {
    bot.reply(message,"*_help init_* or *_help configure_* or *_help issue_* or *_help travis_* or *_help coveralls_*");
  }
});

function helpCommands(){
  return{
    init:"*_init <repository>_*",
    configure:"*_configure <repository>_*",
    issue:"*_test issue_*",
    travis:"*_test travis_*",
    coveralls:"*_test coveralls_*"
  }
}
/**
 * Selenium testing for presence of bot
 * TODO: pull out all selenium tests into their own module
 */
controller.hears('hello world, from Selenium',['mention', 'direct_mention','direct_message', 'ambient'], function(bot,message)
{
  console.log(message);
  bot.reply(message, message.text);
});

/*HELPER FUNCTIONS*/
function initializeRepository(bot,message,repoName,framework){
  setTimeout(function(){
    bot.reply(message,"Done");
  },7000);
}
