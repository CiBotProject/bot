 var Promise = require("bluebird");
var chai = require("chai");
var expect = chai.expect;
var request = require("request");
var nock = require("nock");
var _ = require("underscore");


var data = require("../modules/mocks/coverallsMock.json");

exports.getCoverageInfo = function(commitSHA)
{
	var mockCoverallsService = nock("https://coveralls.io")
			.get("/builds/" + commitSHA + ".json")
			.reply(200, JSON.stringify(data));

	var coverageInfo = {
		"committer_name": data.committer_name,
		"created_at": data.created_at,
		"covered_percent": data.covered_percent,
		"coverage_change": data.coverage_change
	};

	return(coverageInfo);
}

/*

Actual SERVICE code:

function getCoverageInfo(commitSHA)
{
	return new Promise(function(resolve, reject){
		var urlRoot = "https://coveralls.io/builds/" + commitSHA + ".json";
		var options = {
			url: urlRoot
		};
		request(options, function(error, response, body){
			var coverageInfo = JSON.parse(body);
			resolve(coverageInfo);
		});
	});
}

*/

/*

Calling format:

getCoverageInfo("27ea21edef73652eb1e72bd9942eea15c1fe4955").then(function(results){
	console.log("Covered Percent: " + results.covered_percent);
	console.log("Coverage Change: " + results.coverage_change);
});

*/
