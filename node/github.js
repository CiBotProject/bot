var Promise = require("bluebird");
var _ = require("underscore");
var request = require("request");
var querystring = require('querystring');

var token = "token " + process.env.GITHUB_TOKEN;

var urlRoot = process.env.GITHUB_URL ? process.env.GITHUB_TOKEN : "https://api.github.com";

/**
 * Create an issue json object. If optional parameters are not used, they should be passed as a null
 * value.
 * 
 * @param {string} repo
 * @param {string} title
 * @param {?string} body
 * @param {?string[]} assignees
 * @returns {json} object specifying the issue to be created
 */
function generateIssueJSON(title, body, assignees) {};

/**
 * Modify the json for an issue that has already been created. If any parameter is null, it will not
 * be modified. Otherwise, the parameter will overwrite the currently existing content.
 * 
 * @param {json} issue object specifying the original issue to be created
 * @param {?string} repo new repo name
 * @param {?string} title new issue title
 * @param {?string} body new body content
 * @param {?string[]} assignees new assignees
 * @returns {json} object specifying the issue to be created
 */
function modifyIssueJSON(issue, modifications) {};

/**
 * Send a request to GitHub to create an issue on a specific repository
 * 
 * @param {string} repo repository to create the issue in
 * @param {string} owner owner/organization containing the repository
 * @param {json} issue json of the issue to create
 */
function createIssueGitHub(repo, owner, issue) {
    var options = {
		url: urlRoot + "/repos/" + owner +"/" + repo + "/issues",
		method: 'POST',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

	// return new Promise(function (resolve, reject) 
	// {
	// 	// Send a http request to url and specify a callback that will be called upon its return.
	// 	request(options, function (error, response, body) 
	// 	{
	// 		var obj = JSON.parse(body);
	// 		resolve(obj);
	// 	});
	// });
};

/**
 * Get an issue from a GitHub repository and change certain properties of it
 * 
 * @param {string} repo repository where the issue exists
 * @param {string} owner owner/organization containing the repository
 * @param {int} number issue number to modify
 * @param {json} issue issue json to update the current issue with
 * @param {function} confirmCallback callback accepting two parameters (oldIssue, newIssue) that
 *      returns true iff the issue should be replaced
 */
function modifyIssueGitHub(repo, owner, number, issue, confirmCallback) {
    var options = {
		url: urlRoot + "/repos/" + owner +"/" + repo + "/issues/"+number,
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};

    // TODO: get issue
	// return new Promise(function (resolve, reject) 
	// {
	// 	// Send a http request to url and specify a callback that will be called upon its return.
	// 	request(options, function (error, response, body) 
	// 	{
	// 		var obj = JSON.parse(body);
	// 		resolve(obj);
	// 	});
	// });

    // TODO: create temporary new issue, call confirmCallback with changes to confirm

    // TODO: if true, patch the issue
    
    options = {
		url: urlRoot + "/repos/" + owner +"/" + repo + "/issues/" + number,
		method: 'PATCH',
		headers: {
			"content-type": "application/json",
			"Authorization": token
		}
	};
    
    // return new Promise(function (resolve, reject) 
    // {
    // 	// Send a http request to url and specify a callback that will be called upon its return.
    // 	request(options, function (error, response, body) 
    // 	{
    // 		var obj = JSON.parse(body);
    // 		resolve(obj);
    // 	});
    // });
};

exports.generateIssueJSON = generateIssueJSON;
exports.modifyIssueJSON = modifyIssueJSON;
exports.createIssueGitHub = createIssueGitHub;
exports.modifyIssueGitHub = modifyIssueGitHub;
