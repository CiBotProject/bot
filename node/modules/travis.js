const travis = require("travis-ci");
const constant = require("./constants.js").constants;
const data = require("./mocks/travisMock.json");
const nock = require("nock");

let travisToken = "";
let githubToken = process.env.GITHUB_TOKEN;

function authenticate(){
    travis.authenticate({
        github_token: githubToken
    }, function (err) {
        // we've authenticated!  
    });
}

/**
 * This function:
 * 1. synchronize Travis with Github repositories
 * 2. Activate travis CI for the specified repository with owner
 * @param {String} owner //github owner of repo
 * @param {String} repo //github repo name
 */
function init(owner, repo){

    authenticate();
    //todo: sync
    var sync = nock("https://api.travis-ci.org")
        .post("/users/sync").reply(200, {result:true});

    travis.users.sync.post(function (err, res) {
        // res => { 
        //     "result": true 
        // } 
    });

    var hooks = nock("https://api.travis-ci.org")
        .get("/hooks")
        .reply(200, JSON.stringify(data.list_hooks));

    travis.hooks.get(function(err, res){
        //todo: find specified reponame
        var activateHook = nock("https://api.travis-ci.org")
            .put("/hooks/1", {hook:{active:true}})
            .reply(200, "success");

        travis.hooks(1).put({hook:{active:true}});
    });

    let response = constant.constants.message;
    response.status = constant.constants.SUCCESS;
    response.message = `Travis activated for ${owner}/${reponame}`;
    
    return response;
}

/**
 * This function returns yaml file body for specified technology
 * @param {String} technology 
 */
function config(technology){
    let response = {
        status: constant.constants.SUCCESS,
        message: `The yaml file for ${technology}`,
        body: { 
                "language": "node_js", 
                "node_js": [ 
                    "0.10.1" 
                ]
            }
    }

    return response;
}

/**
 * This function returns list of supported technologies in JSON format
 */
function listTech(){
    let techs = [];
    techs.push("Node.js");
    techs.push("Ruby");
    let response = constant.constants.message;
    response.status = constant.constants.SUCCESS;
    response.message = "The list of supported technologies";
    response.body = techs;

    return response;
}

/**
 * This function returns the last build status for specified repo
 * @param {String} owner 
 * @param {String} repo 
 */
function lastBuild(owner, reponame){

    var repo = nock("https://api.travis-ci.org")
        .get(`/repos/${owner}/${reponame}`)
        .reply(200, JSON.stringify(data.show_repo));

    travis.repos(owner, repo).get(function(err, res){
        var requestStatus = nock("https://api.travis-ci.org")
            .get(`/requests`)
            .query({repository_id: res.repo.id})
            .reply(200, JSON.stringify(data.show_request));
        
    })
    
    let response = {
        status: constant.constants.SUCCESS,
        message: `The last build for ${repo} was successful`,
        body: ""
    }

    return response;
}

function listBuilds(owner, reponame){
    let builds = nock("https://api.travis-ci.org")
        .get(`/repos/${owner}/${repo}/builds`)
        .reply(200, JSON.stringify(data.list_builds));

    travis.repos(owner, reponame).builds.get(function(err, res){

    });
    let reponse = constant.constants.message;
    response.status = constant.constants.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = builds;

    return response;
}

function listAccounts(){
    let accounts = nock("https://api.travis-ci.org")
        .get("/accounts")
        .reply(200, JSON.stringify(data.accounts));

    travis.accounts.get(function(err, res){

    });

    let reponse = constant.constants.message;
    response.status = constant.constants.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = accounts;

    return response;
}

module.exports.initiatilize = init;
module.exports.configure = config;
module.exports.listTech = listTech;
module.exports.lastBuild = lastBuild;

//module.exports.listBuilds = listBuilds;
//module.exports.listAccounts = listAccounts;