
var localtunnel = require('localtunnel');
var Botkit = require('botkit');
var Coveralls = require('./modules/coveralls');
var Travis = require('./modules/travis');
var Github = require('./modules/github');
var tokenManager = require("./modules/tokenManager");
var bodyParser = require('body-parser');
// const slack_data = require('data-store')("slack-data",{cwd:"slack-data"});
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var controller = Botkit.slackbot({
  debug: false,
  json_file_store: 'slack-persistent-storage'
});

var defaultThreshold = 95;

var myUrl = '';

var tunnel = localtunnel(3000, {}, function (err, tun) {
  if (err) {
    console.log("\n\n***** TUNNEL ERROR *****\n\n", err);
  }// the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  else {
    console.log(tun.url);
    myUrl = tun.url;
    if (tun.url != myUrl)
      console.log("Url has been changed.. delete yaml file in repo and reinitialize");
  }
});

tunnel.on('close', function () {
  // tunnels are closed
});

var tempIssueName = "", tempIssueBody = "", tempIssueBreaker = "";

// slack_data.set("defaultThreshold",95);


//start the local webserver
app.listen(3000, () => console.log('Example app listening on port 3000'));
app.get('/test', (req, res) => { res.send('Hello') });
// app.get('/test-repo',(req,res) => {res.send(slack_data.get("SlackBot").channel)});
//web server endpoints

//Travis
app.post("/travis/:channel", function (req, res) {
  let payload = JSON.parse(req.body.payload);
  let commit = payload.commit;
  // let repositoryName = payload.repository.name;
  // console.log(payload);
  // console.log(payload.repository);
  //let channel = slack_data.get(repositoryName).channel;
  let channel = req.params.channel;

  let msg = {
    'text': '',
    'channel': channel // channel Id for #slack_integration
  };

  controller.storage.channels.get(channel, function (err, channel_data) {
    if (channel_data) {
      if (payload.state === "failed") {
        msg.text = `Build has failed. To create an issue please type "@${bot.identity.name} create issue"`
        bot.say(msg);

        channel_data.issue.title = `Build with commit_id ${payload.commit_id} has failed`;
        channel_data.issue.breaker = payload.author_email.split('@')[0];
      }
      else {
        Coveralls.getCoverageInfo(commit, channel_data.coverage).then(function (coverage) {

          if (coverage.status === 'success') {
            msg.text = coverage.message;
            bot.say(msg);
          }
          else if (coverage.status === 'failure') {
            var coverageBelowThreshold = channel_data.coverage - coverage.data.body.covered_percent;

            msg.text = `Coverage ${coverageBelowThreshold} percent below threshold. To create an issue please type "@${bot.identity.name} create issue"`
            bot.say(msg);

            channel_data.issue.title = `Coverage ${coverageBelowThreshold} percent below threshold`;
            channel_data.issue.breaker = payload.author_email.split('@')[0];
          }
        });
      }
      saveChannelDataLogError(channel_data, 'POST RESPONSE')
    }
    else {
      console.log(`**POST ERROR** Received post from Travis but could not find a channel!\n\nparams: ${JSON.stringify(req.params)}\npayload: ${JSON.stringify(payload)}`)
    }
  });
  res.send("ack");
});


// connect the bot to a stream of messages
var bot = controller.spawn({
  token: process.env.SLACK_TOKEN,
}).startRTM()

//add token
// TODO convert this to a team storage
controller.hears(['add-token'], ['direct_message'], function (bot, message) {
  console.log(message.text);
  let messageArray = message.text.split(' ');
  if (messageArray.length < 2) {
    bot.reply(message, `The command syntax is *add-token user=token*`);
    return;
  }
  messageArray = messageArray[1].split('=');

  if (messageArray.length < 2) {
    bot.reply(message, `The command syntax is *add-token user=token*`);
    return;
  }

  tokenManager.addToken(messageArray[0], messageArray[1]);
  bot.reply(message, `The user "${messageArray[0]}" token "${messageArray[1]}" is stored:tada::tada::tada:.`)
});
// reset repository
controller.hears(['reset travis'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  getChannelDataOrPromptForInit(message, 'reset travis', function(channel_data){
      controller.storage.channels.delete(message.channel, function (err) {
        console.log(err)
        if (err) {
          bot.reply(message, `There was an error resetting this channel: ${err}`);
          return;
        }
      });
      bot.reply(message, `The channel has been reset. It was initialized to ${channel_data.owner}/${channel_data.repo}`)
  })
});
//init repository
controller.hears(['init travis'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('travis');

  if (messageArray.indexOf('help') === -1 && messageArray.indexOf('travis') !== -1 && messageArray.indexOf('init') !== -1) {

    controller.storage.channels.get(message.channel, function (err, channel_info) {
      console.log(err)
      console.log(channel_info)
      if (channel_info) {
        bot.reply(message, 'This channel has already been initialized.');
        bot.reply(message, 'Reset this channel using the command `reset travis` to initialize another repository.')
        return;
      }
      else {
        //repo name has to be word after init
        var repoString = null;

        if ((index + 1) < messageArray.length)
          repoString = messageArray[index + 1];
        //if repo name is provided
        if (repoString !== null) {
          //format is owner/repo-name
          var repoContent = repoString.split('/');

          controller.storage.channels.save({
            'id': message.channel,
            'repo': repoContent[1],
            'owner': repoContent[0],
            'coverage': defaultThreshold,
            'issue': {
              'breaker': '',
              'title': '',
              'body': ''
            }
          });
          // //map channel to repo
          // slack_data.set(`${message.channel}.repo`,repoContent[1]);
          // //map repo to channel
          // slack_data.set(`${repoContent[1]}.channel`,message.channel);
          // //map channel to owner
          // slack_data.set(`${message.channel}.owner`,repoContent[0]);
          // //create default coverageMap entry
          // slack_data.set(`${message.channel}.coverage`,slack_data.get("defaultThreshold"));

          //console.log(tokenManager.getToken())
          if (tokenManager.getToken(repoContent[0]) === null) {
            bot.reply(message, `Sorry, but token for *${repoContent[0]}* is not found:disappointed:. You can add tokens using the \"*add-token user=token*\" command in a direct message to me. DO NOT send a token where others can see it!`);
            return;
          }

          Travis.activate(repoContent[0], repoContent[1], function (data) {
            bot.reply(message, data.message);
            if (data.status === 'error')
              return;
            bot.startConversation(message, askYamlCreation);
          });

        }
        else {
          bot.reply(message, "Please provide the name of the repository to be initialized. Ex init travis <owner>/<repository>");
        }
      }
    })

  }
  else {
    bot.reply(message, helpCommands().init);
  }
});

//helper functions
function getChannelDataOrPromptForInit (message, location, callback){
  console.log(message)
  console.log(location)
  controller.storage.channels.get(message.channel, function(err, channel_data){
    if (callback === undefined) {
      callback = location
      location = '';
    }
    else {
      location += ' ';
    }
    if (channel_data){
      callback(channel_data);
    }
    else {
      console.log(`Error getting ${location}channel data.\nChannel: ${message.channel}\nerr: ${err}`);
      bot.reply(message, "Please run init travis <owner>/<repository> before calling this method");
    }
  })
}

function saveChannelDataLogError (data, location) {
  if (location === undefined) {
    location = '';
  }
  else {
    location += ' ';
  }
  controller.storage.channels.save(data, function(err){
    if (err) {
      console.log(`Data save ${location}failed.\ndata: ${JSON.stringify(data)}\nerror: ${err}`)
    }
  })
}

askYamlCreation = function (response, convo) {
  convo.ask('Would you like to create a yaml file (yes/no)?', function (response, convo) {
    if (response.text.toLowerCase() === "yes") {
      askLanguageToUse(response, convo);
      convo.say(`Default coverage threshold for the current repository is set to ${defaultThreshold}%`);
      convo.next();
    } else if (response.text.toLowerCase() === "no") {
      convo.say("Initialized repository without yaml");
      convo.say(`Default coverage threshold for the current repository is set to ${defaultThreshold}"%`);
      convo.next();
    }
    else {
      convo.say("I consider this response to be a 'no'. I have initialized repository without yaml");
      convo.say(`Default coverage threshold for the current repository is set to ${defaultThreshold}%`);
      convo.next();
    }
  });
}

askLanguageToUse = function (response, convo) {
  convo.ask('Which language do you want to use? ' + Travis.listTechnologies().data.body.join(', '), function (response, convo) {
    getChannelDataOrPromptForInit(response, 'askLanguageToUse', function(channel_data){
      let repo = channel_data.repo;
      let owner = channel_data.owner;
      var yamlStatus = Travis.createYaml(response.text, myUrl, response.channel);
      if (yamlStatus.status === 'success') {
        //yamlStatus.data.body needs to be passed
        convo.say("I am pushing the yaml file to the github repository ");

        //push yaml to repository
        Github.createRepoContents(owner, repo, yamlStatus.data.body, ".travis.yml").then(function (res) {
          convo.say("Pushed the yaml file to the github repository ");
        }).catch(function (res) {

          convo.say("Error pushing the yaml file to the github repository. Please try and run init travis <owner>/<reponame> ensuring correct details ");
          controller.storage.channels.delete(response.channel, function (err) {
            if (err)
              console.log(`Tried resetting channel ${response.channel}; received error ${err}`)
          })
          // slack_data.delete(repo);

        });
      }
      else {
        convo.say("Error in creating yaml file");
        convo.say("See https://docs.travis-ci.com/user/languages/ to set up your repository.");
        controller.storage.channels.delete(response.channel, function (err) {
          if (err)
            console.log(`Tried resetting channel ${response.channel}; received error ${err}`)
        })
        // slack_data.delete(repo);
      }
      convo.next();
    })
  });
}

//configure yaml
controller.hears(['configure yaml'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  //start conversation with one user, replies from other users should not affect this conversation
  //TODO: test this functionality by letting a different user reply, expected outcome should be no reply from bot to that user
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('yaml');


  if (messageArray.indexOf('help') === -1 && messageArray.indexOf('yaml') !== -1 && messageArray.indexOf('configure') !== -1) {
    //repo name has to be word after init
    var repoString = null;
    if ((index + 1) < messageArray.length)
      repoString = messageArray[index + 1];
    //if repo name is provided
    if (repoString !== null) {
      //format is owner/repo-name
      var repoContent = repoString.split('/');

      Travis.activate(repoContent[0], repoContent[1], function (data) {
        bot.reply(message, data.message);
        if (data.status === 'error')
          return;
        bot.startConversation(message, askYamlCreation);
      });

    }
    else {
      bot.reply(message, "Please provide the name of the repository to be configured. Ex configure yaml <owner>/<repository>");
    }
  }
  else {
    bot.reply(message, helpCommands().configure);
  }
});

//testing issue creation
controller.hears(['create issue'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  console.log(message)
  getChannelDataOrPromptForInit(message, 'create issue', function(channel_data){
    bot.startConversation(message, askToCreateIssue);
  })
});



//setting Coveralls threshold
controller.hears(['set coverage threshold', 'set threshold'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  //TODO add bounds between 0 - 100 as it is percentage
  var messageArray = message.text.split(' ');
  var index = messageArray.indexOf('to');

  //repo name has to be word after init
  getChannelDataOrPromptForInit(message, 'set threshold', function(channel_data){
    if ((index + 1) < messageArray.length) {
      channel_data.coverage = parseInt(messageArray[index + 1]);
      controller.storage.channels.save(message.channel, channel_data, function (err) {
        if (err) {
          bot.reply(message, 'There was an error changing the coverage');
        }
        else {
          bot.reply(message, `The coverage threshold has been set to ${channel_data.coverage}`);
        }
      })
    }
    else {
      bot.reply(message, "Please provide the coverage threshold. Ex set coverage threshold to <number>");
    }
  })
});

//help section
//TODO:test last build help
controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  var messageArray = message.text.split(' ');

  if (messageArray.indexOf('init') !== -1) {
    bot.reply(message, helpCommands().init);
  }
  else if (messageArray.indexOf('configure') !== -1) {
    bot.reply(message, helpCommands().configure);
  }
  else if (messageArray.indexOf('issue') !== -1) {
    if (messageArray.indexOf('change') !== -1) {
      bot.reply(message, helpCommands().existing_issue);
    }
    else {
      bot.reply(message, helpCommands().issue);
    }
  }
  else if (messageArray.indexOf('coveralls') !== -1) {
    bot.reply(message, helpCommands().coveralls);
  }
  else {
    bot.reply(message, "*_help init travis_*, *_help configure yaml_*, *_help issue creation_*");
  }
});

function helpCommands() {
  return {
    init: "*_init travis <owner>/<repository>_*",
    configure: "*_configure yaml <owner>/<repository>_*",
    issue: "*_create issue_*",
  }
}

/*HELPER FUNCTIONS*/
function initializeRepository(bot, message, repoName, framework) {
  setTimeout(function () {
    bot.reply(message, "Done");
  }, 7000);
}
//helper functions

askToCreateIssue = function (response, convo) {
  getChannelDataOrPromptForInit(convo.source_message, 'askToCreateIssue', function(channel_data){
    if (channel_data.issue.title === "") {
      askToCreateNewIssue(response, convo);
    }
    else {
      askToCreateExistingIssue(response, convo);
    }
  })
}

askToCreateNewIssue = function (response, convo) {
  getChannelDataOrPromptForInit(convo.source_message, 'askToCreateNewIssue', function(channel_data){
    convo.ask('Please enter the name of the issue', function (response, convo) {
      channel_data.issue.title = response.text;
      saveChannelDataLogError(channel_data, 'askToCreateNewIssue')

      convo.say(`I'm creating an issue titled *${channel_data.issue.title}*`);
      askToAssignPeople(response, convo);
      convo.next();
    });
  })
}

askToCreateExistingIssue = function (response, convo) {
  getChannelDataOrPromptForInit(convo.source_message, 'askToCreateExistingIssue', function(channel_data){
    let name = channel_data.issue.title;
    let body = '';

    if (name.includes("Coverage")) {
      channel_data.issue.body = "Coveralls failure";
    }
    else if (name.includes("Build")) {
      channel_data.issue.body = "Build failure";
    }
    saveChannelDataLogError(channel_data, 'askToCreateExistingIssue');

    convo.ask(`Current issue title is set to *${name}*. Do you want to change the title of the issue (yes/no)?`, function (response, convo) {
      if (response.text.toLowerCase() === "yes") {
        askToCreateNewIssue(response, convo);
      }
      else {
        askToAssignPeople(response, convo);
      }
      convo.next();
    });

  })
}

askToAssignPeople = function (response, convo) {
  getChannelDataOrPromptForInit(convo.source_message, 'askToAssignPeople', function(channel_data){
    convo.ask('Please enter a comma-separated list of github usernames to the issue. Ex user1,user2,user3...', function (response, convo) {
      let listOutput = response.text;
      console.log(response.text);
  
      // split and strip assignees
      let listOfassignees = listOutput.split(",").map(function(item) {
        return item.trim();
      });;
      let issueName = channel_data.issue.title
  
      convo.say(`I am going to create an issue titled *${issueName}* and assign it to ` + listOutput);

      let repo = channel_data.repo;
      let owner = channel_data.owner;

      var tempObject = {
        'body': `Automatically generated issue ${channel_data.issue.body}`,
        'assignees': listOfassignees,
        'breaker': channel_data.issue.breaker
      };

      console.log(repo, owner, tempObject, issueName);

      Github.createGitHubIssue(repo, owner, Github.createIssueJSON(repo, owner, issueName, tempObject))
        .then(function (res) {
          console.log(res.message);
          bot.reply(response, res.message);
          //convo.say(res.message);
        }, function (res) {

          console.log(res.message);
          bot.reply(response, res.message);
          //convo.say(res.message);
        });

      channel_data.issue.title = '';
      channel_data.issue.body = '';
      channel_data.issue.breaker = '';
      saveChannelDataLogError(channel_data, 'askToAssignPeople');
      convo.next();
    });
  })
}
