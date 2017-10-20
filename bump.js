#!/usr/bin/env node
'use strict';

var multiline = require('multiline'),
	program = require('commander'),
	api = require('./index'),
	prompt = require('prompt'),
	//execSync = require('child_process').execSync,
	currentGitBranch,manifests,prefix;

function bumpVersion(manifests,type,prefix,options){
	manifests.forEach(function(manifest){
		api.bump(manifest, type, prefix);
	});

	options.tags && api.tag(options.push, prefix);
}

function getPrefix(manifests){
	var currentPrefix;
	manifests.some(function(manifest){
		currentPrefix = api.getField(manifest,"prefix");
		return currentPrefix;
	});
	return currentPrefix;
}

function getUserDefinedPrefix(manifests,type,prefix,options){
	prompt.start();
	prompt.get(['prefix'], function (err, result) {
		console.log('Command-line input received:');
		console.log('  prefix: ' + result.prefix);
		prefix = result.prefix;
		prompt.stop();

		bumpVersion(manifests,type,prefix,options);

	});
}

program
	.version(require('./package').version)
	.usage('[options]')
	.option('--no-tags', 'Do not create git tag')
	.option('--push', 'Push to remote repo')
	.option('--prefix [value]', 'Add prefix to tag name');

//currentGitBranch = execSync('git rev-parse --abbrev-ref HEAD',{encoding: 'utf8'}).replace(/\n/g,''); //remove
manifests = api.manifests();

// setTimeout(function(){
// 	//get prefix
// 	program.prefix && (program.prefix = (typeof program.prefix === "string") ? program.prefix : currentGitBranch);
// });

['patch', 'minor', 'major'].forEach(function(type){
	program.option('--' + type, 'Increase ' + type + ' version');

	program.on(type, function(){
		setTimeout(function(){

			if (program.prefix) {
				prefix = getPrefix(manifests);

				console.log("Current prefix: ", prefix);

				if(prefix){
					bumpVersion(manifests,type,prefix,{
						"tags": program.tags,
						"push": program.push
					});
				} else {
					getUserDefinedPrefix(manifests,type,prefix,{
						"tags": program.tags,
						"push": program.push
					});
				}

			} else {

				bumpVersion(manifests,type,prefix,{
					"tags": program.tags,
					"push": program.push
				});

			}

		}, 0);
	});
});

/*program.on('prefix',function(){
	prefix = getPrefix(manifests);
});*/

program.on('--help', function(){
	console.log(multiline(function(){/*
  Usage:

    $ bump --patch
    $ bump --patch --no-tags
    $ bump --info
	*/}));
});

program.parse(process.argv);

if(program.rawArgs.length < 3){
	program.help();
}

