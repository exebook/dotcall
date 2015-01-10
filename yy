#!/usr/bin/env node
// --max_old_space_size=1400 --max_new_space_size=1024
var name = process.argv[2]
if (name == undefined) {
	console.log('dotcall error: no input file')
	return
}
symjs = require('/v/js/dotcall/dotcall.js')
symjs.handleExt('.yy')
symjs.userSym('⏚', 'ground')
module.paths.push(process.cwd())

if (name[0] == '.') name = process.cwd() + '/' + name

//console.log('REQUIRENAME:',name)

require(name)

