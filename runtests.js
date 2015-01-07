#!/usr/bin/js

var requirejs = require("requirejs");
var fs = require("fs");

requirejs.config({
	nodeRequire: require
});

require("amdefine/intercept");

var testsDir = "./tests";

//requirejs(fs.readdirSync(testsDir).map(function(filename) {
//	return testsDir + "/" + filename.substr(0, filename.indexOf("."));
//}));

requirejs([
	"./tests/Position",
	"./tests/Time",
	"./tests/Game",
	"./tests/Move",
	"./tests/Square",
	"./tests/getEpPawn"
]);