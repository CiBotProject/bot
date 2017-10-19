const travis = require("travis-ci");

let travisToken = "";
let response = {};

/**
 * This function:
 * 1. synchronize Travis with Github repositories
 * 2. Activate travis CI for the specified repository with owner
 * @param {String} owner //github owner of repo
 * @param {String} repo //github repo name
 * @param {String} token //github token
 */
function init(owner, repo, token){
    response["status"] = 200;
    response["message"] = `Travis activated for ${owner}/${repo}`;
    return response;
}

/**
 * This function returns yaml file body for specified technology
 * @param {String} technology 
 */
function config(technology){
    response = {
        status: 200,
        message: `The yaml file for ${technology}`,
        body: "yaml file content"
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
    response["status"] = 200;
    response["message"] = "The list of supported technologies";
    response["body"] = techs;

    return response;
}
/**
 * This function returns the last build status for specified repo
 * @param {String} token 
 * @param {String} owner 
 * @param {String} repo 
 */
function lastBuild(token, owner, repo){
    response = {
        status: 200,
        message: `The last build for ${repo} was successful`,
        body: ""
    }

    return response;
}

module.exports.initiatilize = init;
module.exports.configure = config;
module.exports.listTech = listTech;
module.exports.lastBuild = lastBuild;
