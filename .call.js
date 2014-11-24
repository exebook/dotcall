var name = process.argv[2]
if (name == undefined) {
	console.log('dotcall error: no input file')
	return
}
require('./dotcall')
require('./' + name)
