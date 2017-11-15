#!/usr/bin/env node
'use strict';

var multiline = require('multiline'),
	program = require('commander'),
	api = require('./index'),
	prompt = require('prompt'),
	chalk = require('chalk');

function bumpVersion(manifests, type, prefix, options){
	manifests.forEach(function(manifest){
		api.bump(manifest, type, prefix);
	});

	options.tags && api.tag(options.push, prefix);
}

function getPrefix(manifests){
	var currentPrefix;
	manifests.some(function(manifest){
		currentPrefix = api.getField(manifest, 'prefix');
		return currentPrefix;
	});
	return currentPrefix;
}

program
	.version(require('./package').version)
	.usage('[options]')
	.option('--no-tags', 'Do not create git tag')
	.option('--push', 'Push to remote repo')
	.option('--prefix', 'Add prefix to tag name');

['patch', 'minor', 'major'].forEach(function(type){
	program.option('--' + type, 'Increase ' + type + ' version');

	program.on(type, function(){
		setTimeout(function(){
			var manifests = api.manifests(),
				promptScheme = {
					properties: {
						prefix: {
							description: chalk.greenBright('\nPlease Enter new prefix'),
							type: 'string',
							pattern: /^[a-zA-Z]+(-?[a-zA-Z\d]+)*$/,
							message: chalk.yellowBright('Prefix should begin with a letter, contain only letters, digits, one hyphen as a delimiter between phrases and do not end on hyphen.'),
							required: true
						}
					}
				},
				options = {
					'tags': program.tags,
					'push': program.push
				},
				prefix;

			if (program.prefix) {
				prefix = getPrefix(manifests);

				if(prefix){
					bumpVersion(manifests,type,prefix,options);
				} else {
					prompt.message = chalk.redBright('Current prefix not found');
					prompt.start();
					prompt.get(promptScheme, function (err, result) {
						prefix = result.prefix;
						prompt.stop();
						bumpVersion(manifests,type,prefix,options);
					});
				}

			} else {
				bumpVersion(manifests,type,prefix,options);
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

