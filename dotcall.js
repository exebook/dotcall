var fs = require('fs')
var dcconvert = require('./dcconvert')

function compile(s) {
	s = dcconvert.dotcallConvert(s)
	fs.writeFileSync('out.js', s)
	return s
}

loadFile = function(module, filename) {
	var raw, stripped;
	raw = fs.readFileSync(filename, 'utf8');
	stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
	return module._compile(compile(stripped), filename);
};

if (require.extensions) {
   require.extensions['.dc'] = loadFile
}
 
module.exports.handleExt = function(ext) {
	if (require.extensions) {
	   require.extensions[ext] = loadFile
	}
}