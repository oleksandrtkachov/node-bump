#!/usr/bin/env node
'use strict';

var multiline = require('multiline'),
	program = require('commander'),
	api = require('./index'),
	execSync = require('child_process').execSync,
	currentGitBranch;

program
	.version(require('./package').version)
	.usage('[options]')
	.option('--no-tags', 'Do not create git tag')
	.option('--push', 'Push to remote repo')
	.option('--prefix [value]', 'Add prefix to tag name');

currentGitBranch = execSync('git rev-parse --abbrev-ref HEAD',{encoding: 'utf8'}).replace(/\n/g,'');

setTimeout(function(){
	program.prefix && (program.prefix = (typeof program.prefix === "string") ? program.prefix : currentGitBranch);
});

['patch', 'minor', 'major'].forEach(function(type){
	program.option('--' + type, 'Increase ' + type + ' version');

	program.on(type, function(){
		setTimeout(function(){
			api.manifests().forEach(function(manifest){
				api.bump(manifest, type, program.prefix);
			});

			if(program.tags){
				api.tag(program.push,program.prefix);
			}

		}, 0);
	});
});

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

