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

// TAKE TOKEN OUT

var token = 'token ' + 'YOUR_TOKEN';
var github_url_root = 'https://api.github.com'

// GET /repos/:owner/:repo/contents/:path
// May return a single object if :path refers to a file.
// May return an array of objects if :path refers to a directory.

function get_repo_contents(owner, repo)
{
    var options = {
        url: github_url_root + '/repos/' + owner + '/' + repo + '/contents',
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

exports.get_repo_contents = get_repo_contents;