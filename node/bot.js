
var Botkit = require('botkit');
var Coveralls = require('./modules/coveralls');
var Travis = require('./modules/travis');
//var childProcess = require("child_process");

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

var repoName = null;

var globals = {
  coverageMap:{},//channel:threshold amount
  repoMap:{},//channel:repo name
  ownerMap:{},
  defaultThreshold:90,
};

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.SLACK_TOKEN,
}).startRTM()

//init repository
controller.hears(['init travis'],['direct_message','direct_mention','mention'],function(bot,message){
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('travis');

  if(messageArray.indexOf('help')===-1){
    //repo name has to be word after init
    if((index+1)<messageArray.length)
        repoString = messageArray[index+1];
    //if repo name is provided
    if(repoString!==null){
      //format is owner/repo-name
      bot.startConversation(message,function(err,convo){
        convo.say("I am initializing the repository...");
        //add entry of channel_name:repo_name to the repoMap
        var repoContent = repoString.split('/');

        globals.repoMap[message.channel]=repoContent[1];
        globals.ownerMap[message.channel]=repoContent[0];
        //create default coverageMap entry
        globals.coverageMap[message.channel]=globals.defaultThreshold;

        Travis.activate(repoContent[0],repoContent[1],function(data){
          bot.reply(message,data.message);
        });
        /*
        convo.ask('Would you like to create a yaml file as well?',[
          {
            pattern:bot.utterances.yes,
            callback:function(response,convo){
              convo.next();
              convo.ask('Which language do you want to use? '+Travis.listTechnologies().data.body.join(','),function(response,convo){
                //TODO:support for random string with tech name
                var yamlStatus = Travis.createYaml(response.text);
                if(yamlStatus.status==='success'){
                    //yamlStatus.data.body needs to be passed
                    convo.say("Yaml created");
                    //convo.next();
                }
                else{
                    convo.say("Error in creating yaml file");
                    //convo.next();
                }
              });
            }
          },
          {
            pattern:bot.utterances.no,
            callback:function(response,convo){
              convo.next();
              convo.say("Alright, continuing with initialization");
              //github init
              //convo.next();
            }
          },
          {
            default:true,
            callback:function(response,convo){
              convo.next();
              convo.repeat();
              //convo.next();
            }
          }
        ],{},'default');
        */
        ////convo.next();
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
            //convo.next();
            initializeRepository(bot,message,repoName,"node");

          }
          else{
            convo.say("Sorry, I am not smart enough to create that config :disappointed:");
            //convo.next();
          }
        });

      });
    }
    else{
      bot.reply(message,helpCommands().configure);
    }
});
//test last build and create issue on failure
controller.hears(['test last build'],['direct_message','direct_mention','mention'],function(bot,message){

  Travis.lastBuild(globals.ownerMap[message.channel],globals.repoMap[message.channel],function(data){
    bot.reply(message,data.message);
    if(data.status==='failure')
      issueCreationConversation(bot,message,`Build failure`);
  });

});
//testing issue creation
controller.hears(['test issue'],['direct_message','direct_mention','mention'],function(bot,message){
  issueCreationConversation(bot,message);
});
//testing Travis
controller.hears(['test travis','test Travis'],['direct_message','direct_mention','mention'],function(bot,message){
  bot.reply(message,"Testing travis");
});

//testing Coveralls and issue creation
controller.hears(['test coveralls','test Coveralls'],['direct_message','direct_mention','mention'],function(bot,message){

  var coverage = Coveralls.getCoverageInfo("123",globals.coverageMap[message.channel]);

  bot.reply(message,coverage.message);

  if(coverage.status==='failure'){
    var coverageBelowThreshold = globals.coverageMap[message.channel] - coverage.data.body.covered_percent;
    issueCreationConversation(bot,message,`Coverage ${coverageBelowThreshold} percent below threshold`);
  }

});

//setting Coveralls threshold
controller.hears(['set coverage threshold','set threshold'],['direct_message','direct_mention','mention'],function(bot,message){
  //TODO add bounds between 0 - 100 as it is percentage
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('to');

  //repo name has to be word after init
  if((index+1)<messageArray.length){
      globals.coverageMap[message.channel] = parseInt(messageArray[index+1]);
      bot.reply(message,"The coverage threshold has been set to "+globals.coverageMap[message.channel]);
  }
  else{
      bot.reply(message,"Please provide the coverage threshold. Ex set coverage threshold to <number>");
  }
});

//help section
//TODO:test last build help
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
    init:"*_init travis <owner>/<repo_name>_*",
    configure:"*_configure <owner>/<repository>_*",
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

function issueCreationConversation(bot,message,issueTitle){

  var issueFlag = true,issueChange = false;

  bot.startConversation(message,function(err,convo){

    convo.addQuestion('Do you want to create an issue (yes/no)?',function(response,convo){
      if(response.text.toLowerCase().includes("yes")){
        issueFlag = true;
      }
      else{
        issueFlag = false;
      }
      convo.next();
    },{},'default');



    if(issueFlag){
      //if no issue title exists
      if(!issueTitle || issueTitle===""){
          convo.addQuestion('Please enter the title of the issue',function(response,convo){
            convo.say("Thanks! I'll name the issue *"+response.text+"*");
            issueTitle = response.text;
            convo.next();
          },{},'default');
      }
      else{
          convo.addQuestion('Current issue title is set to *_'+issueTitle+'_*.Do you want to change the title of the issue (yes/no)?',function(response,convo){
            if(response.text.toLowerCase().includes("yes")){
              issueChange = true;
            }else{
              issueChange = false;
            }
            convo.next();
          },{},'default');

      }

      if(issueChange){
          convo.addQuestion('Please enter the title of the issue',function(response,convo){
            convo.say("Thanks! I'll name the issue *"+response.text+"*");
            issueTitle = response.text;
            convo.next();
          },{},'default');
      }else{
        bot.reply(message,"No problem, I'll keep the title as it is!");
      }

        convo.addQuestion('Please enter a comma-separated list of assignees to the issue. Ex @user1,@user2,@user3...',function(response,convo){
          var assigneeList = response.text.split(',');
          var listOutput = response.text;
          convo.say(`I am going to create an issue titled *${issueTitle}* and assign it to `+listOutput);
          convo.next();
        },{},'default');

    }
    else{
      bot.reply(message,'Okay, I\'m not creating an issue');
    }
  });
}
