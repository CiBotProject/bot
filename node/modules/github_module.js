var _ = require('underscore');
var botkit = require('botkit');
var chai = require('chai');
var fs = require('fs');
var nock = require('nock');
var parse = require('parse-link-header');
var promise = require('bluebird');
var querystring = require('querystring');
var request = require('request');

var expect = chai.expect;

var init_module = require('../modules/initialization_module.js');

var token = 'token ' + process.env.GITHUB_TOKEN;
var github_url_root = 'https://api.github.com'

// GET /repos/:owner/:repo/contents/:path
// Status: 200 OK
// May return a single object if :path refers to a file.
// May return an array of objects if :path refers to a directory.
function get_repo_contents(owner, repo)
{
    var options =
    {
        url: `${github_url_root}/repos/${owner}/${repo}/contents`,
        method: 'GET',
        headers:
        {
            'User-Agent': 'get_repo_contents',
            'Content-Type': 'applicaiton/json',
            'Authorization': token
        }
    };

    return new Promise(function(resolve, reject)
    {
        request(options, function(error, response, body)
        {
            var contents = JSON.parse(body);
            resolve(contents);
        });
    });
}

// GET /repos/:owner/:repo/contents/.travis.yml
// Status: 200 OK
// The SHA of the existing .travis.yml or .coveralls.yml file is needed to update or delete.
function get_yaml_sha(owner, repo, file)
{
    var options =
    {
        url: `${github_url_root}/repos/${owner}/${repo}/contents/${file}`,
        method: 'GET',
        headers:
        {
            'User-Agent': 'get_yaml_sha',
            'Content-Type': 'application/json',
            'Authorization': token
        }
    };

    return new Promise(function(resolve, reject)
    {
        request(options, function(error, response, body)
        {
            var contents = JSON.parse(body);
            var sha = contents.sha.toString();
            resolve(sha);
        });
    });
}

// PUT /repos/:owner/:repo/contents/:path
// Status: 201 Created
// The parameters 'path', 'message', and 'content' are required.
function create_repo_contents(owner, repo, content, file)
{
    var options =
    {
        url: `${github_url_root}/repos/${owner}/${repo}/contents/${file}`,
        method: 'PUT',
        headers:
        {
            'User-Agent': 'create_repo_contents',
            'Content-Type': 'application/json',
            'Authorization': token
        },
        json:
        {
            'path': file,
            'message': `[CiBot] Create ${file}`,
            'content': `${init_module.encode_base64(content)}`
        }
    };

    return new Promise(function(resolve, reject)
    {
        request(options, function(error, response, body)
        {
            resolve(body);
        });
    });
}

// PUT /repos/:owner/:repo/contents/:path
// Status: 200 Created
// The parameters 'path', 'message', 'content', and 'sha' are required.
function update_repo_contents(owner, repo, content, file)
{

}

// DELETE /repos/:owner/:repo/contents/:path
// Status: 200 OK
// The parameters 'path', 'message', and 'sha' are required.
function delete_repo_contents(owner, repo, file)
{

}

// Export methods for external use.
exports.get_repo_contents = get_repo_contents;
exports.create_repo_contents = create_repo_contents;
exports.update_repo_contents = update_repo_contents;
exports.delete_repo_contents = delete_repo_contents;