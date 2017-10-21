var _ = require('underscore');
var botkit = require('botkit');
var chai = require('chai');
var fs = require('fs');
var nock = require('nock');
var parse = require('parse-link-header');
var Promise = require('bluebird');
var querystring = require('querystring');
var request = require('request');

var expect = chai.expect;

var init_module = require('../modules/initialization.js');

var token = 'token ' + process.env.GITHUB_TOKEN;
var urlRoot = process.env.GITHUB_URL ? process.env.GITHUB_TOKEN : "https://api.github.com";

// Signature to append to all generated issues
var issueBodySignature = '\n\nCreated by CiBot!';

// GET /repos/:owner/:repo/contents/:path
// Status: 200 OK
// May return a single object if :path refers to a file.
// May return an array of objects if :path refers to a directory.
function get_repo_contents(owner, repo)
{
    var options =
    {
        url: `${urlRoot}/repos/${owner}/${repo}/contents`,
        method: 'GET',
        headers:
        {
            'User-Agent': 'get_repo_contents',
            'Content-Type': 'application/json',
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
        url: `${urlRoot}/repos/${owner}/${repo}/contents/${file}`,
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
        url: `${urlRoot}/repos/${owner}/${repo}/contents/${file}`,
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
function reset_repo_contents(owner, repo, content, file)
{
    get_yaml_sha(owner, repo, file).then(function(data)
    {
        var options =
        {
            url: `${urlRoot}/repos/${owner}/${repo}/contents/${file}`,
            method: 'PUT',
            headers:
            {
                'User-Agent': 'reset_repo_contents',
                'Content-Type': 'application/json',
                'Authorization': token
            },
            json:
            {
                'message': `[CiBot] Reset ${file}`,
                'content': `${init_module.encode_base64(content)}`,
                'sha': `${data}`
            }
        };

        return new Promise(function(resolve, reject)
        {
            request(options, function(error, response, body)
            {
                resolve(body);
            });
        });
    });
}

// DELETE /repos/:owner/:repo/contents/:path
// Status: 200 OK
// The parameters 'path', 'message', and 'sha' are required.
function delete_repo_contents(owner, repo, file)
{

}

/**
 * Parse optional fields in a json
 * @param {*} options variable containing the optional arguments
 * @param {*} name name of the optional variable
 * @param {*} defaultValue default for the variable
 * @param {*} returns the set parameter or the default value
 */
function opt(options, name, defaultValue) {
	if (defaultValue == undefined){
		defaultValue = null;
	}
	return options && options[name] !== undefined ? options[name] : defaultValue;
}

/**
 * Check to see if a user is a collaborator for a specific repository
 * @param {*} repo repository to check
 * @param {*} owner owner of the repository
 * @param {*} user user to test for membership in collaborators
 */
function checkUserInCollaborators(repo, owner, user) {
	var options = {
		url: urlRoot + "/repos/" + owner + "/" + repo + "/collaborators/" + user,
		method: 'GET',
		headers: {
			"user-agent": "CiBot",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	return new Promise(function (resolve, reject) {
		request(options, function (error, response, body) {
			var valid = false;
			if (response !== undefined && response.statusCode == 204) {
				valid = true;
			}
			resolve({'valid': valid, 'user':user})
		});
	});
}

/**
 * Create an issue json object. The optional parameters should be set as a field in the `optional` field. If you 
 * do not want to include teh parameters, leave them out of the json.
 * 
 * The text contained within the body will be appended with the text in global variable `bodySignature`.
 * 
 * @param {string} repo The repo that we are creating an issue for
 * @param {string} owner The owner of the repo that we are creating an issue for
 * @param {string} title The title of the issue that we are creating
 * @param {?json} optional json object containing the optional fields (body, assignees)
 * @param {?string} optional.body The body of the issue to be created
 * @param {?string[]} optional.assignees A list of individuals to assign the issue to
 * @returns {json} object specifying the issue to be created
 */
function createIssueJSON(repo, owner, title, optional) {
	if (optional == undefined){
		optional = {};
	}
	var body = opt(optional, 'body', '') + issueBodySignature;
	var assignees = opt(optional, 'assignees', [])

	// Determine if all of the users are valid collaborators for the project
	var validUserFunction = function(user){
		return checkUserInCollaborators(repo, owner, user);
	}
	var users = Promise.all(assignees.map(validUserFunction));

	// Once we have the result for all of the users, create the issue with all valid ones as an assignee(s)
	return users.then(function(users){
		var issue = {
			"repo": repo,	// needed for us not GitHub
			"owner": owner,	// needed for us not GitHub
			"title": title,
			"body": body,
			"assignees": [],
			"labels": [
				"bug", "CiBot"
			]
		}
		users.forEach(function(user){
			if (user.valid){
				issue.assignees.push(user.user);
			}
		})
		return issue;
	});
};

/**
 * Modify the json for an issue that has already been created. If any optional parameter is absent, it will not
 * be modified. Otherwise, it will be replaced.
 * 
 * @param {Promise<json>} issue object specifying the original issue to be created
 * @param {?json} optional object containing the optional fields (repo, title, body, assignees)
 * @param {?string} optional.repo The new repo to add the issue to
 * @param {?string} optional.owner The owner of the new repo that we are creating an issue for
 * @param {?string} optional.title new issue title
 * @param {?string} optional.body new body content
 * @param {?string[]} optional.assignees new assignees
 * @returns {Promise<json>} object specifying the issue to be created
 */
function modifyIssueJSON(issue, optional) {
	if (optional == undefined){
		optional = {};
	}

	// Make sure the issue has been finished
	return issue.then(function(resolvedIssue){
		// Determine what needs to be changed on the issue and change it!
		var regenerate = false;
		if (optional.title != undefined){
			resolvedIssue.title = optional.title;
		}
		if (optional.body != undefined){
			resolvedIssue.body = optional.body + issueBodySignature;
		}
		if (optional.assignees != undefined){
			// We have to check all of the assignees, so just regenerate the issue
			resolvedIssue.assignees = optional.assignees;
			regenerate = true;
		}
		if (optional.repo != undefined || optional.owner != undefined){
			// we have to recheck all of the assignees since we are changing the repo, so just regenerate the issue
			regenerate = true;
		}

		// regenerate the issue if necessary
		if (regenerate){
			var re = new RegExp(issueBodySignature, "g");
			resolvedIssue.body = resolvedIssue.body.replace(re, '');
			resolvedIssue.repo = optional.repo == undefined ? resolvedIssue.repo : optional.repo;
			resolvedIssue.owner = optional.owner == undefined ? resolvedIssue.owner : optional.owner;
			return createIssueJSON(resolvedIssue.repo, 
				resolvedIssue.owner, 
				resolvedIssue.title, 
				{'body': resolvedIssue.body, 'assignees':resolvedIssue.assignees});
		}
		return resolvedIssue;
	});
};

/**
 * Send a request to GitHub to create an issue on a specific repository
 * 
 * @param {string} repo repository to create the issue in
 * @param {string} owner owner/organization containing the repository
 * @param {Promise<json>} issue json of the issue to create
 */
function createGitHubIssue(repo, owner, issuePromise) {
	// Delete the repo and owner from the issue json before sending to GitHub
	// but keep track of it to make sure that we have a json file that can be submitted here
	return issuePromise.then(function(issue){
		var iRepo = issue.repo;
		var iOwner = issue.owner;
		delete issue.repo;
		delete issue.owner;

		var options = {
			url: urlRoot + "/repos/" + owner + "/" + repo + "/issues",
			method: 'POST',
			headers: {
				"user-agent": "CiBot",
				"content-type": "application/json",
				"Authorization": token
			},
			json: issue
		};

		return new Promise(function (resolve, reject) 
		{
			// If we are trying to submit to a repo that the issue was not created for, error out.
			if (iRepo !== repo || iOwner !== owner){
				reject('The issue was created for a different repository than it was submitted to.');
			}
			// Send a http request to url and specify a callback that will be called upon its return.
			request(options, function (error, response, body) 
			{
				// var obj = JSON.parse(body);
				resolve(body);
			});
		});
	})
};

/** TESTING CODE FOR ISSUES! */
// var issue
// createIssueJSON('test', 'arewm', 'test', {'body': 'test!!', 'assignees': ['arewm', 'bubba']}).then(function(i){
// 	console.log(i);
// 	issue = i;
// })
// console.log(issue);
// var i2 = createIssueJSON('test', 'arewm', 'test', {'body': 'test!!', 'assignees': ['arewm', 'bubba']});
// console.log(i2)
// i2.then(console.log);
// i2 = modifyIssueJSON(i2, {'title': 'test2'})
// console.log(i2);
// i2.then(console.log);
// createGitHubIssue('test', 'arewm', i2).then(console.log);
// var i3 = createIssueJSON('test', 'arewm', 'test-3', {'body': 'test!!', 'assignees': ['arewm', 'bubba']});
// createGitHubIssue('test', 'arewm', i3).then(console.log);


// Export methods for external use.
exports.get_repo_contents = get_repo_contents;
exports.create_repo_contents = create_repo_contents;
exports.reset_repo_contents = reset_repo_contents;
exports.delete_repo_contents = delete_repo_contents;
exports.createIssueJSON = createIssueJSON;
exports.modifyIssueJSON = modifyIssueJSON;
exports.createGitHubIssue = createGitHubIssue;
exports.modifyGitHubIssue = modifyGitHubIssue;