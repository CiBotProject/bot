const constant = require("./constants.js");
const data = require("./mocks/travisMock.json");
const nock = require("nock");
const request = require("request");
const YAML = require("json2yaml")

const supportedTechs = require("./travisData/yamlLanguages.json")
const utils = require('./utils')

let token = "token ";
let githubToken = process.env.GITHUB_TOKEN;
let urlRoot = "https://api.travis-ci.org";

// lastBuild("test", "test", function(data){
//     console.log(data);
// });
//authenticate();
// activate("test", "test", function(data){
//     console.log(data);
// });
//console.log(listTech());
//console.log(config("Ruby"));
//console.log(config("Huskell"));


/**
 * This function:
 * 1. synchronize Travis with Github repositories
 * 2. Activate travis CI for the specified repository with owner
 * @param {String} owner //github owner of repo
 * @param {String} reponame //github repo name
 */
function activate(owner, reponame, callback){

    //todo: first of all sync it.

    let repoNock = nock("https://api.travis-ci.org")
        .get(`/repos/${owner}/${reponame}`)
        .reply(200, data.get_repo);

    let options = {
        url: `${urlRoot}/repos/${owner}/${reponame}`,
        method: 'GET',
        headers:
        {
            'User-Agent': 'CiBot',
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }
    var resp = constant.getMessageStructure();

    request(options, function(err, res, body){
        let hookNock = nock(urlRoot).put("/hooks")
            .reply(200, data.put_hook);

        options.url = `${urlRoot}/hooks`;
        options.method = "PUT";
        request(options, function(err, res, body){

            resp.status = constant.SUCCESS;
            resp.message = `Travis activated for ${owner}/${reponame}`;
            resp.data.body = body;
            callback(resp);
        })
    })


}

/**
 * This function returns yaml file body for specified technology
 * @param {String} technology
 * @param {String} postUrl URL to post build notifications to
 */
function createYaml(technology, postUrl,owner,repo){
    let resp = constant.getMessageStructure();

    if(!supportedTechs.hasOwnProperty(technology.toLowerCase())){
        resp.status = constant.FAILURE;
        resp.message = `Sorry I can't create yaml for ${technology}`;
        resp.data = null;
        return resp;
    }
    let techJson = supportedTechs[technology.toLocaleLowerCase()];

    if (postUrl !== undefined){
        techJson.notifications.webhooks.push(postUrl+"/travis");
    }

    let yaml = YAML.stringify( techJson );
    console.log(yaml)
    resp.status = constant.SUCCESS;
    resp.message = `The content of yaml file for ${technology}`;
    resp.data.body = utils.encodeBase64(yaml);

    return resp;
}

/**
 * This function returns list of supported technologies in JSON format
 */
function listTechnologies(){
    let available = [];
    for (k in supportedTechs) {
        available.push(k.charAt(0).toUpperCase() + k.slice(1));
    }
    let response = constant.getMessageStructure();
    response.status = constant.SUCCESS;
    response.message = "The list of supported technologies";
    response.data.body = available;

    return response;
}

/**
 * This function returns the last build status for specified repo
 * @param {String} owner
 * @param {String} repo
 */
function lastBuild(owner, reponame, callback){

    let resp = constant.getMessageStructure();

    let buildsNock = nock("https://api.travis-ci.org")
        .get(`/repos/${owner}/${reponame}/builds`)
        .reply(200, JSON.stringify(data.list_builds));

    let options = {
        url: `${urlRoot}/repos/${owner}/${reponame}/builds`,
        method: 'GET',
        headers:
        {
            'User-Agent': 'CiBot',
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }

    request(options, function(err, res, body){
        //console.log(body);
        let json = JSON.parse(body);

        let lastBuildId = json.builds[0].id;
        let lastBuildState = json.builds[0].state;
        if(lastBuildState === 'failed'){
            json.commits.filter(function(path){
                return path.id === json.builds[0].commit_id;
            }).forEach(function(path){
                resp.status = constant.FAILURE;
                resp.message = `The last build for ${owner}/${reponame} failed`;
                resp.data.body = path;
                resp.data.blame.push(path.author_email);
                callback(resp);
            });
        } else if(lastBuildState === 'success'){
            resp.status = constant.SUCCESS;
            resp.message = `The last build for ${owner}/${reponame} succeed`;
            callback(resp);
        }
    });
}

module.exports.activate = activate;//activates travis for repo. Params: owner, reponame, callback
module.exports.lastBuild = lastBuild;//returns last build state. Params: owner, reponame, callback
module.exports.createYaml = createYaml;//create the yaml for specified technology. Params: technology
module.exports.listTechnologies = listTechnologies;//list supported technologies. No params.

function listAccounts(){
    let accounts = nock("https://api.travis-ci.org")
        .get("/accounts")
        .reply(200, JSON.stringify(data.accounts));

    travis.accounts.get(function(err, res){

    });

    let response = constant.getMessageStructure();
    response.status = constant.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = accounts;

    return response;
}


function listBuilds(owner, reponame){
    let builds = nock("https://api.travis-ci.org")
        .get(`/repos/${owner}/${repo}/builds`)
        .reply(200, JSON.stringify(data.list_builds));

    travis.repos(owner, reponame).builds.get(function(err, res){

    });
    let response = constant.getMessageStructure();
    response.status = constant.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = builds;

    return response;
}

function authenticate(){
    travis.auth.github.post({
        github_token: githubToken
    }, function (err, res) {
        // res => {
        //     access_token: XXXXXXX
        // }
        console.log(res.access_token);

    });
}
