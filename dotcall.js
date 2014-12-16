var fs = require('fs')
var dcconvert = require('./convert')

function compile(s) {
	s = dcconvert.dotcallConvert(s)
//	fs.writeFileSync('out.tmp', s)
//	process.exit()
	//log = console.log
	return s
}

loadFile = function(module, filename) {
	var raw, s;
	raw = fs.readFileSync(filename, 'utf8');
	s = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
	if (s[0] == '#' && s[1] == '!') {
		var i = s.indexOf('\n')
		s = s.substr(i)
	}
	return module._compile(compile(s), filename);
};

if (require.extensions) {
   require.extensions['.yy'] = loadFile
   require.extensions['.dc'] = loadFile
}
module.exports.require = function(f) {
	var raw, b;
	raw = fs.readFileSync(f, 'utf8');
	b = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
	eval(compile(b))
}
module.exports.convert = dcconvert.dotcallConvert
module.exports.userSym = dcconvert.userSym
module.exports.handleExt = function(ext) {
	if (require.extensions) {
	   require.extensions[ext] = loadFile
	}
}