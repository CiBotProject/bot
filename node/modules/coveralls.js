var Promise = require("bluebird");
var chai = require("chai");
var expect = chai.expect;
var request = require("request");
var nock = require("nock");
var _ = require("underscore");


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

/*

Calling format: 

getCoverageInfo("27ea21edef73652eb1e72bd9942eea15c1fe4955").then(function(results){
	console.log("Covered Percent: " + results.covered_percent);
	console.log("Coverage Change: " + results.coverage_change);
});

*/