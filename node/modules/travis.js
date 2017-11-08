const clone = require('clone');
const constant = require("./constants.js");
const data = require("./mocks/travisMock.json");
const nock = require("nock");
const request = require("request");
const tokenManager = require("./tokenManager");

let token = "token ";
let userAgent = "Travis CiBot";
let githubToken = process.env.GITHUB_TOKEN;

let urlRoot = "https://api.travis-ci.org";
let message = clone(constant.message);
let supportedTechs = ["Node.js", "Ruby"];

/**
 * This function:
 * 1. synchronize Travis with Github repositories
 * 2. Activate travis CI for the specified repository with owner
 * @param {String} owner //github owner of repo
 * @param {String} reponame //github repo name
 */
function activate(owner, reponame, callback){

    //todo: first of all sync it.

    // let repoNock = nock("https://api.travis-ci.org")
    //     .get(`/repos/${owner}/${reponame}`)
    //     .reply(200, data.get_repo);
    authenticate(owner, function(){
        let options = {
            url: `${urlRoot}/repos/${owner}/${reponame}`,
            method: 'GET',
            headers:
            {
                'User-Agent': userAgent,
                'Content-Type': 'application/json',
                'Authorization': token
            }
        }
        var resp = clone(constant.message);
    
        request(options, function(err, res, body){
            // let hookNock = nock(urlRoot).put("/hooks")
            //     .reply(200, data.put_hook);
            body = JSON.parse(body);

            options.url = `${urlRoot}/hooks`;
            options.method = "PUT";
            options.json = {
                hook:{
                    id:body.id,
                    active:true
                }
            }
            request(options, function(err, res, body){
    
                resp.status = constant.SUCCESS;
                resp.message = `Travis activated for ${owner}/${reponame}`;
                resp.data.body = body;
                callback(resp);
            });
        });
    });    
    

    
}

/**
 * This function returns yaml file body for specified technology
 * @param {String} technology 
 */
function createYaml(technology){
    let resp = clone(constant.message);

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
function listTechnologies(){
    
    let response = clone(constant.message);
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

    let resp = clone(constant.message);

    // let buildsNock = nock("https://api.travis-ci.org")
    //     .get(`/repos/${owner}/${reponame}/builds`)
    //     .reply(200, JSON.stringify(data.list_builds));

    let options = {
        url: `${urlRoot}/repos/${owner}/${reponame}/builds`,
        method: 'GET',
        headers:
        {
            'User-Agent': userAgent,
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

    let response = clone(constant.message);
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
    let response = clone(constant.message);
    response.status = constant.SUCCESS;
    response.message = `Here is the build list for ${owner}/${reponame}`;
    response.body = builds;

    return response;
}

function authenticate(user, callback){
    let options = {
        url: `${urlRoot}/auth/github`,
        method: 'POST',
        headers:
        {
            'User-Agent': userAgent,
            'Content-Type': 'application/json',
            'Authorization': token
        },
        json:{
            github_token:githubToken
        }
    }

    request(options, function(err, res, body){
        if(err) throw err;
        console.log(body);
        token += body.access_token;
        callback();
    })
}