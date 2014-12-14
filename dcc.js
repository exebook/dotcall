var dc = require('./dotcall')
var fs = require('fs')
var fin = process.argv[2]
if (fin) {
	var s = fs.readFileSync(fin).toString()
	s = dc.convert(s)
	process.stdout.write(s)
} else {
	console.log('node dcc <in>')
}


