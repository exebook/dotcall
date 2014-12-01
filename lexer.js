module.exports.join = join
module.exports.lex = function(s) {
	if (!symLookupTable) symLookupTable = buildSymLookupTree()
	return mainLoop(s)
}
var symLookupTable

function isCharNum(c) { return (c >= '0' && c <= '9') }

function isCharAlpha(c) { 
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
}

function buildSymLookupTree() {
	var syms = ':: ( ) [ ] { } .( , ; . - + * / % ~ | ++ -- != || && == === >= <= += -= *= /= %= >> << >>= <<= >>> <<< >>>= <<<='
	var L = syms.split(' '), T = {}
	L.forEach(function(x) {
		var Z = T
		for (var i = 0; i < x.length; i++) {
			var c = x.charAt(i)
			if (!Z[c]) Z[c] = {}
			Z = Z[c]
		}
	})
	return T
}

function checkSym(s, i){
	var Z = symLookupTable, x = i
	while (Z = Z[s[x]]) x++
	return x
}

function mainLoop(s) {
	var R = [], i = 0, ch, e = s.length, O
	while (i < e) {
		ch = s[i]
		if (ch == '\n') {
			O = {type:'line', s:'\n'}
			i++
		} else if (ch==' '||ch=='\t'||ch=='\r') {
			var b = i
			while (++b < e) {
				c = s[b]
				if (c != ' ' && c != '\t' && c != '\r') break
			}
			O = {type:'space', s:cut()}
		} else if (isCharAlpha(ch)) {
			var b = i
			while (++b < e) {
				c = s[b]
				if (isCharAlpha(c) || isCharNum(c)) continue
				break
			}
			O = {type:'id', s:cut()}
		} else if (isCharNum(ch)) {
			var b = i
			while (++b < e) if (!isCharNum(s[b])) break
			O = {type:'num', s:cut()}
		} else if (ch == '"' || ch == "'") {
			b = i
			while (true) {
				b++
				b = s.indexOf(ch, b)
				if (b < 0 || s[b - 1] != '\\') break
			}
			if (b < 0) b = e; else b++
			O = {type:'str', s:cut()}
		} else if (ch == '/' && s[i+1] == '*') {
			b = s.indexOf('*/', i+2)
			if (b < 0) b = e; else b+=2
			O = {type:'rem', s:cut()}
		} else if (ch == '/' && s[i+1] == '/') {
			b = s.indexOf('\n', i+2)
			if (b < 0) b = e
			O = {type:'rem', s:cut()}
		} else {
			var b = checkSym(s, i)
			if (b > i) O = {type:'sym', s:cut()}
			else {
				O = {type: 'tok', s:s[i++]}
				console.log('UNRECOGNIZED TOKEN:', O.s)
			}
		}
		R.push(O)
	}
	return R
	function cut() { var R = s.substr(i, b-i); i=b; return R }
}

function join(A, untab) {
	var R = []
	for (var i = 0; i < A.length; i++) R.push(untab?A[i].s.replace('\t', '   '):A[i].s)
	return R.join('')
}
