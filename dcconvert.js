module.exports.dotcallConvert = dotcallConvert
module.exports.setPrefix = function(s){ PREFIX = s }

var PREFIX = 'DOTCALL'

/*
		updateStr
		
	insert into s everything from array like E[{x:pos, s:str},{x:pos, s:str}]
*/

function updateStr(s, E) {
	E = E.sort(function(a, b){ return a.x - b.x })
	var R = [], x = 0
	for (var i = 0; i < E.length; i++) {
		var l0 = E[i].x - x, a = s.substr(x, l0)
		R.push(a, E[i].s)
		x += l0
	}
	var x = E[E.length - 1].x
	R.push(s.substr(x, s.length - x))
	return R.join('')
}

/*
		scanBlock
	
	this will find in the string s the start and
	the end positions for the current block
	specified by x.
*/

function scanBlock(s, x) {
	var a = findBlockStart(s, x)
	var b = findBlockEnd(s, a)
	return {a:a, b:b}
	
	function findBlockStart(s, x) {
		var level = 0
		for (var i = x; i >= 0; i--) {
			if (s[i] == '}') level++
			if (s[i] == '{') {
				if (level == 0) return i
				level--
			}
		}
	}

	function findBlockEnd(s, x) {
		var level = 0, e = s.length
		for (var i = x; i < e; i++) {
			if (s[i] == '{') level++
			if (s[i] == '}') {
				level--
				if (level == 0) return i
			}
		}
	}
}

function trimStr(s) {
	return s.replace(/^\s+|\s+$/g,"")
}

function insertAsyncCalls(R, async) {
	var E = []
	for (var i = 0; i < async.length; i++) {
		var x = scanBlock(R, async[i].x)
		async[i].e = x.b
		E.push({x:afterSpace(R, async[i].x), s: async[i].s})
		E.push({x:async[i].e, s: '}) '})
	}
	R = updateStr(R, E)
	return R

	/*
			afterSpace
		
		find the first non space character in the string
		"			f()"
		^-x      ^-return this position
	*/

	function afterSpace(s, x) {
		var b = x
		while (s[x] == ' ' || s[x] == '\t') x++
		var t = ''
		return x
	}
}

/*
		lookForDotCalls
	
	first step: parsing of .(
	once ".(" pattern is found in source code, we first scan to the left
	to find the function name, then we scan to the right, to get 
	all the arguments and save found positions in calls[].
*/

function lookForDotCalls(source) {
	var i = 0, calls = [], callN = 1
	while (true) {
		i = source.indexOf('.(', i)
		if (i < 0) break
		var a = scanName(source, i - 1)
		var p = scanCall(source, i+2)
		var n = scanCR(source, i)
		var t = source.substr(a, i - a)
		var c = source.substr(i+1, p - i - 1)
		var r = [], rx = 0
		parseDoubleColonSyntax()
		calls.push({a:a, b:p+1, t: t+c, n: n, r:r, rx:rx})
		i += 2
	}
	return calls
	
/*
		parseDoubleColonSyntax()
	
	by default the callback is supposed to accept a single argument
	but since many API have two or more args, for instance one for error
	another for data, etc, we have special syntax here:
	f.(12345 :: a, b, c)
	console.log(b)

	coverted to

	f(12345, function(a, b, c){
		console.log(b)
	})
*/
	function parseDoubleColonSyntax() {
		if (c.indexOf('::') >= 0) {
			c = c.split('::')
			var u = parseInt(c[1])
			if (u > 0) {
				rx = u-1
				while (u-- > 0) r.push('' + PREFIX + callN++)
			} else r = c[1].split(',')
			c = c[0]
		} else r = ['' +PREFIX + callN++]
	}
	
/*
		scanName, scanCR, scanCall
	
	Scan utilites. See dotcallConvert for explanations of what are those
	substrings.
*/
	
	function scanName(s, i) {
		// TODO allow "[expr]" and "(expr)"
		var ok = '.[]qazwsxedcrfvtgbyhnujmikolp_QAZWSXEDCRFVTGBYHNUJMIKOLP1234567890'
		while (true) {
			if (ok.indexOf(s[i]) < 0) return i + 1
			i--
			if (i < 0) return 0
		}
	}

	function scanCR(s, i) {
		while (true) {
			if (s[i] == '\n') return i + 1
			if (--i < 0) return 0
		}
	}

	function scanCall(s, i) {
		var level = 0, e = s.length
		while (true) {
			if (s[i] == '(') level ++
			if (s[i] == ')') {
				if (level == 0) return i
				level--
			}
			i++
			if (i == e) return e
		}
	}
}

/*
		replaceArguments
		
	Second pass of conversion. Replace what we found left from ".("
	and what we found right to ".("
	And prepare "function" statement.
*/

function replaceArguments(source, calls) {
	var async = []
	var R = ''
	var e = source.length, X = 0
	calls.push({a:e,b:e,n:e})
	for (var  i = 0; i < calls.length; i++) {
		var A = calls[i]
		R += source.substr(X, A.n - X)
		if (!A.t) break
		var comma = ''
		if (A.t[A.t.length - 1] != '(') comma = ', '
		var s = A.t +comma+ 'function (' + A.r.join(',') + ') { '
		async.push({x:R.length, s:s})
		R += source.substr(A.n, A.a-A.n)
		R += trimStr(A.r[A.rx])
		X = A.b
	}
	R = insertAsyncCalls(R, async)
	return R
}

/*
		dotcallConvert(source code) -> converted source code
	
	main function in the module, basic logic is this,
	consider we have this code:
	
	function main() {
		myfunc.(12345)
	}
	
	it contains 4 important positions:
	
		myfunc.(123, 45)
	^  ^     ^        ^  
	A  B     C        D
	
	A - "async" or "CR", begining of line, place where we insert the 
			actual async call statement
	B - "name", start of function name
	C - "dotcall", end of name, start of ".("
	D - "args", end of arguments, resume unprocessed code
	
	
*/

function dotcallConvert(source) {
	var calls = lookForDotCalls(source)
	if (calls.length > 0) {
		var R = replaceArguments(source, calls)
		return R
	}
	return source // return untouched source
}

/*

	Original test case

This is the test case that have been used as a reference 
for the first implementation

-- source --

function main() {
	if (myfu.()) {
		var d = myfu2.(55)// outputs 555
		console.log(d)
	}
}

-- target --

myfu(function (DOTCALL1) {
	if (DOTCALL1) {
		myfu2(55, function (DOTCALL2) {
			d = DOTCALL2
			console.log(d) // outputs 555
		})
	}
})

*/

