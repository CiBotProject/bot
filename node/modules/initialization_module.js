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

var githb_module = require('../modules/github_module.js');

//////////////////////////
//                      //
//    TRAVIS METHODS    //
//                      //
//////////////////////////

// MAYBE - Define a method to activate Travis CI on a repo.
function activate_travis(owner, repo)
{

}

// Define a method to check for Travis CI file.
function has_travis_yaml(owner, repo)
{
    return new Promise(function(resolve, reject)
    {
        githb_module.get_repo_contents(owner, repo).then(function(contents)
        {
            var file_names = _.pluck(contents, 'name');
            
            if(_.contains(file_names, '.travis.yml'))
                resolve(true);
            else
                resolve(false);
        });
    });
}

// Define a method to create Travis CI file.
function create_travis_yaml(owner, repo, content)
{
    
}

// Define a method to update Travis CI file.
function update_travis_yaml(owner, repo, content)
{
    
}

// Define a method to delete Travis CI file.
function delete_travis_yaml(owner, repo)
{
    
}

/////////////////////////////
//                         //
//    COVERALLS METHODS    //
//                         //
/////////////////////////////

// MAYBE - Define a method to activate Coveralls on a repo.
function activate_coveralls(owner, repo)
{

}

// Define a method to check for Coveralls file.
function has_coveralls_yaml(owner, repo)
{
    return new Promise(function(resolve, reject)
    {
        githb_module.get_repo_contents(owner, repo).then(function(contents)
        {
            var file_names = _.pluck(contents, 'name');
            
            if(_.contains(file_names, '.coveralls.yml'))
                resolve(true);
            else
                resolve(false);
        });
    });
}

// Define a method to create Coveralls file.
function create_coveralls_yaml(owner, repo, options)
{
    
}

// Define a method to update Coveralls file.
function update_coveralls_yaml(owner, repo, options)
{
    
}

// Define a method to delete Coveralls file.
function delete_coveralls_yaml(owner, repo)
{
    
}

/////////////////////////////////
//                             //
//    MISCELLANEOUS METHODS    //
//                             //
/////////////////////////////////

function encode_base64(decoded_content)
{
    return Buffer.from(decoded_content).toString('base64');
}

function decode_base64(encoded_content)
{
    return Buffer.from(encoded_content, 'base64').toString();
}

// Export methods for external use.
exports.activate_travis = activate_travis;
exports.has_travis_yaml = has_travis_yaml;
exports.create_travis_yaml = create_travis_yaml;
exports.update_travis_yaml = update_travis_yaml;
exports.delete_travis_yaml = delete_travis_yaml;

exports.activate_coveralls = activate_coveralls;
exports.has_coveralls_yaml = has_coveralls_yaml;
exports.create_coveralls_yaml = create_coveralls_yaml;
exports.update_coveralls_yaml = update_coveralls_yaml;
exports.delete_coveralls_yaml = delete_coveralls_yaml;

exports.encode_base64 = encode_base64;
exports.decode_base64 = decode_base64;