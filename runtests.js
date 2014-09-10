#!/usr/bin/js

var requirejs = require("requirejs");
var fs = require("fs");

requirejs.config({
	nodeRequire: require
});

var testsDir = "./tests";

//requirejs(fs.readdirSync(testsDir).map(function(filename) {
//	return testsDir + "/" + filename.substr(0, filename.indexOf("."));
//}));

requirejs([
	"./tests/Board",
	"./tests/CastlingRights",
	"./tests/Time",
	"./tests/Game",
	"./tests/Move"
]);