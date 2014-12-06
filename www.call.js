document.write('.call loaded')
require = req
log = function() { console.log.apply(console, arguments) }
var dotcallConvert = function(s) { return s }
var count = 1
module = {exports:{}}, handledExts = []
handleExt('dc')
dotcallConvert = require('convert.js').dotcallConvert
handleExt = handleExt

function req(name, f) {
	var M = {exports:{}}
	var X = new XMLHttpRequest()
	X.open("GET", name, false)//true);
	X.send();
	var T = module.exports
	module.exports = M
	var src = X.responseText
	if (handledExts.indexOf(name.split('.').pop()) >= 0)
		src = dotcallConvert(src)
	eval(src)
	module.exports = T
	return M
}

function handleExt(ext) {
	handledExts.push(ext)
}
//	X.onreadystatechange = function() {
//		if (X.readyState==4 && X.status==200) {
//			eval(dotcallConver(X.responseText))
//			if (f) f()
//		}
//	}

