const constant = require("./constants.js");
const data = require("./mocks/travisMock.json");
const nock = require("nock");
const request = require("request");

let token = "token ";
let githubToken = "dacf2fc16170fe47f50edb21628b0a36fcc00cd5";
let urlRoot = "https://api.travis-ci.org";
let message = constant.message;
let supportedTechs = ["Node.js", "Ruby"];

lastBuild("test", "test", function(data){
    console.log(data);
});
//authenticate();
// activate("test", "test", function(data){
//     console.log(data);
// });
//console.log(listTech());
//console.log(config("Ruby"));
//console.log(config("Huskell"));

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
    var resp = constant.message;

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
 */
function config(technology){
    let resp = constant.message;

    if(supportedTechs.indexOf(technology) < 0){
        resp.status = constant.FAILURE;
        resp.message = `Sorry I can't create yaml for ${technology}`;
        resp.data = null;
        return resp;
    }
    
    resp.status = constant.SUCCESS;
    resp.message = `The content of yaml file for ${technology}`;
    resp.data.body = "bGFuZ3VhZ2U6IG5vZGVfanMKbm9kZV9qczoKLSAic3RhYmxlIgphZnRlcl9zdWNjZXNzOgotIG5wbSBydW4gY292ZXJhbGxz";

    return resp;
}

/**
 * This function returns list of supported technologies in JSON format
 */
function listTech(){
    
    let response = constant.message;
    response.status = constant.SUCCESS;
    response.message = "The list of supported technologies";
    response.data.body = supportedTechs;

    return response;
}

/**
 * This function returns the last build status for specified repo
 * @param {String} owner 
 * @param {String} repo 
 */
function lastBuild(owner, reponame, callback){

    let resp = constant.message;

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


module.exports.activate = activate;
module.exports.configure = config;
module.exports.listTech = listTech;
module.exports.lastBuild = lastBuild;

//module.exports.listBuilds = listBuilds;
//module.exports.listAccounts = listAccounts;


function listAccounts(){
    let accounts = nock("https://api.travis-ci.org")
        .get("/accounts")
        .reply(200, JSON.stringify(data.accounts));

    travis.accounts.get(function(err, res){

    });

    let reponse = constant.message;
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
    let reponse = constant.message;
    response.status = constant.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = builds;

    return response;
}
