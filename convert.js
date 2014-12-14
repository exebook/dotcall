module.exports.dotcallConvert = dotcallConvert
module.exports.dotcallConvert = dotcallConvert
var PREFIX = 'DOTCALL', callNumber = 1, lex = require('./lexer.js')
function getId() {
	callNumber++
	return ''+PREFIX+callNumber
}

function dotcallConvert(s) {
	var t = '❶❷❸❹❺❻❼❽❾❿', d = '①②③④⑤⑥⑦⑧⑨⑩'
	var ix = '⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʱʳˢᵗᵘᵛʷˣʸᶻ',
		re = '0123456789abcdefghijklmnopqrstuvwxyz'
	var R = lex.lex(s)
	for (var i = 0; i < ix.length; i++) simpleReplace(R, ix[i], '['+re[i]+']')
	for (var i = 0; i < t.length; i++) {
		var t1 = t[i], d1 = d[i]
		simpleReplace(R, t1, 'var var'+ i +' = ')
		simpleReplace(R, d1, 'var'+ i, 'id')
	}
	findVar(R)
	findLog(R, 'ロ')
	findLog(R, '#')
	findLast(R)
	findStrEqu(R, '≈', '=')
	findStrEqu(R, '∼', '==')
	findStrEqu(R, '≁', '!=')
	simpleReplace(R, '⌶', '.split')
	simpleReplace(R, '⫴', '.join')
	simpleReplace(R, '⋃', '.slice')
	simpleReplace(R, '⨄', '.splice')
	simpleReplace(R, 'ꔬ', '.filter')
	simpleReplace(R, '⧉', '.map')
	simpleReplace(R, 'ꗚ', '.concat')
	simpleReplace(R, '❄', '.sort')
	simpleReplace(R, '⩪', '.substr')
	simpleReplace(R, '△', '.charAt')
	simpleReplace(R, '◬', '.charCodeAt')

 	simpleReplace(R, '≂', '.toString()')
 	simpleReplace(R, '≀', '.indexOf')
 	simpleReplace(R, '≀≀', '.lastIndexOf')
 	simpleReplace(R, '⦙', ';')
 	simpleReplace(R, '★', 'parseInt')
	simpleReplace(R, '⬠', 'Math.round')
	simpleReplace(R, '⍽', 'Math.floor')
	simpleReplace(R, '♻', 'continue;')
	simpleReplace(R, '⚂', 'Math.random()')
	simpleReplace(R, '⚪', 'this')
	simpleReplace(R, '⚫', 'this.')
	simpleReplace(R, '⬤', 'typeof ')
	simpleReplace(R, '⌿⌚', 'clearInterval')
	simpleReplace(R, '⌿⌛', 'clearTimeout')
	simpleReplace(R, '⟡', 'new ')
	simpleReplace(R, '⏀', 'delete ')

//	simpleReplace(R, '', '')
	simpleReplace(R, '⊜', '= 0')
	simpleReplace(R, '⌥', 'if')
	simpleReplace(R, '⧗', 'for')
	simpleReplace(R, '⧖', 'while')
	simpleReplace(R, '∞', 'while(true)')
	simpleReplace(R, '⬊', '.push')
	simpleReplace(R, '⬈', '.pop()')
	simpleReplace(R, '⬉', '.shift()')
	simpleReplace(R, '⬋', '.unshift')
	simpleReplace(R, '⬍', '.forEach')
	simpleReplace(R, '⦾', 'false')
	simpleReplace(R, '⦿', 'true')
	simpleReplace(R, '≠', '!=')
	simpleReplace(R, '≟', '==')
	simpleReplace(R, '≣', 'require')
	simpleReplace(R, '⌚', 'setInterval')
	simpleReplace(R, '⌛', 'setTimeout')
	simpleReplace(R, '⎇', 'else ')
	simpleReplace(R, '↥', '.length')
	simpleReplace(R, '∅', 'undefined')
	simpleReplace(R, '"∅"', '"undefined"')
	simpleReplace(R, "'∅'", "'undefined'")
	simpleReplace(R, '∇', 'var ')
	simpleReplace(R, '$', 'return ')
	simpleReplace(R, '@', 'break')
	findColon(R, '➮', 'function')
	var t = joinAdd(R)
	R = lex.lex(t)
	// findMacros(R)
	findEachs(R, handleEach)
	findDotCalls(R, handleCall)
	return lex.join(R,true)
}

function trimStr(str) {
	return str.replace(/^\s+|\s+$/g,"");
}

function handleFor(A, i) {
	var forId = getId(), argId = getId()
	var start = i - 1
	var args = getArgs(A, i + 1)
	var block = args.b + 2; while (A[block].s != '{') block++
	var endFor = getEnd(A, block+1)
	var endUp = getEnd(A, endFor+1)
	var fors = lex.join(A.slice(args.a, args.b + 1)).split(';')
	for (var ff = 0; ff < 3; ff++) fors[ff] = trimStr(fors[ff])
	if (fors[1] == '') fors[1] = 'true'
	for (var x = block; x < endFor; x++) if (A[x].s == 'break')
		A[x].s = '{ '+argId+'(); return }'
	A.splice(endUp, 0, {type:'re', s:'}'},{type:'re', s:')'})
	insertStart()
	exitFor()
	function exitFor() {
		A[endFor+1].add = ['\n\t'+forId+'(function() {']
		A.splice(endFor, 0,{type:'re',
		s:'  '+fors[2]+'; setImmediate('+forId+', '+argId+')\n\t'})
	}
	function insertStart() {
		for (var x = start; x <= args.b + 1; x++) A[x].s = ''
		A[args.a].s = fors[0] + '; function '+forId+'('+argId+') '
		A[args.a+1] = A[block]
		A[block] = {type:'re',s:'\n\t\tif ((' + fors[1] + ') == false)'+
			' { '+argId+'(); return }'}
	}
}

function handleWhile(A, i) {
	var args = getArgs(A, i + 1)
	for (var x = args.a; x <= args.b; x++) A[x].s = ''
	A.splice(args.a, 0, {type:'re',s:';'},{type:'re',s:args.txt},{type:'re',s:';'})
	handleFor(A, i)
}

function handleEach1(A, i) {
	var e = A.length, fun = 0, a = i
	A[i].s = 'for'
	while (i < e && A[i].s != '(') i++, console.log('scan');
	a = i+1
	while (i < e) {
		var c = A[i]
		if (c.s == ')') if (fun > 1) fun--; else break
		if (c.s == '(') fun++
		i++
	}
	var args = lex.join(A.slice(a, i)).split(',')
	args[0] = trimStr(args[0]), args[1] = trimStr(args[1])
	console.log(args)
	for (var x = a; x < i; x++) A[x].s = ''
	A[a-1].s = '(var '+args[0]+' = 0; '+args[0]+' < '+args[1]+'.length; '+args[0]+'++'
}

Object.defineProperty(Array.prototype, 'last', {
	get: function(){ return this[this.length - 1] }
})

function getNameRight(A, i) {
	var e = A.length, fun = 0, arr = 0, R = []
	while (i < e) {
		var c = A[i]
		var none = false
		if (fun > 0) {
			if (c.s == ')') fun--; else if (c.s == '(') fun++
		}
		else if (arr > 0) {
			if (c.s == ']') arr--; else if (c.s == '[') arr++
		}
		else if (c.s == '(') fun++
		else if (c.s == '[') arr++
		else if (c.s == '.') ;
		else if (c.type == 'id') {
			if (R.last && R.last.type == 'id') break
		}
		else if (c.type == 'space') ;
		else none = true
		if (!none && c.type != 'space' && c.type != 'line') R.push(c)
		if (none) break
		i++
	}
	return [R, i]
}

function handleCall(A, i) {
	var name = getNameLeft(A, i - 1)
	var nameStr = lex.join(A.slice(name.a, name.b + 1))
	if (nameStr == 'for') {	handleFor(A, i); return	}
	if (nameStr == 'while') { handleWhile(A, i); return	}
	var line = getLine(A, i)
	var args = getArgs(A, i + 1)
	var end = getEnd(A, i)
	var comma = ''; if (args.txt!='') comma = ', '
	A[line].s = A[line].s+''+nameStr+'('+args.txt+comma+'function ('+args.C.join(',')+') { '
	for (var i = name.a; i < args.b + 2; i++) A[i].s = ''
	A[name.a].s = args.N+''
	if (!A[end].add) A[end].add = []
	A[end].add.push('})')
}

function getLine(A, i) {
	while (i-- > 0) {
		if (A[i].type == 'line') {
			while (A[i + 1].type == 'space') i++
			return i
		}
	}
}

function getNameLeft(A, i) {
	var fun = 0, arr = 0, b = i
	while (i > 0) {
		var c = A[i]
		if (fun > 0) {
			if (c.s == '(') fun--; else if (c.s == ')') fun++
		}
		else if (arr > 0) {
			if (c.s == '[') arr--; else if (c.s == ']') arr++
		}
		else if (c.s == ')') fun++
		else if (c.s == ']') arr++
		else if (c.s == '.') ;
		else if (c.type == 'id') ;
		else if (c.type == 'space') ;
		else break
		i--
	}
	i++
	while (A[b].type == 'space') b--
	while (A[i].type == 'space') i++
	return {a:i,b:b}
}

function getArgs(A, i) {
	var e = A.length, fun = 0, a = i
	while (i < e) {
		var c = A[i]
		if (c.s == ')') if (fun > 0) fun--; else break
		if (c.s == '(') fun++
		i++
	}
	var R = {a:a, b:i-1, N:''}, e = i, C = [], on = false
	for (var x = a; x < i; x++) {
		if (on && (A[x].type == 'id' || A[x].type == 'num')) C.push(A[x].s)
		else if (A[x].s == '::') on = true, e = x
	}
	R.txt = lex.join(A.slice(a, e))
	if (C.length == 1) {
		var Q = parseInt(C[0])
		if (Q > 0) {
			C = []
			while(Q-- > 0)
				C.push(getId())
			R.N = C[C.length-1]
		}
	} else if (C.length == 0) {
		R.N = getId()
		C.push(R.N)
	}
	R.C = C
	return R
}

function getEnd(A, i) {
	var e = A.length, level = 0, a = i
	while (i < e) {
		var c = A[i]
		if (c.s == '}') if (level > 0) level--; else return i
		if (c.s == '{') level++
		i++
	}
}

function joinAdd(A) {
	var R = []
	for (var i = 0; i < A.length; i++) {
		var s = A[i].s, a = A[i].add
		if (a) s = a.join(' ') + ' '+ s
		R.push(s)
	}
	return R.join('')
}

function findDotCalls(A, f) {
	for (var i = 0; i < A.length; i++) {
		if (A[i].s == '.(') f(A, i)
		if (A[i].add) A[i].s = A[i].add.join(' ') +' '+ A[i].s
	}
}

function addTo(X, s) {
	if (!X.add) X.add = []
	X.add.push(s)
}

function next(A, i) {
	while (A[++i].type == 'space');// i++
	return i
}

function prev(A, i) {
	while (A[--i].type == 'space');// i--
	return i
}

function simpleReplace(A, find, replace, type) {
	for (var i = 0; i < A.length; i++) {
		if (A[i].s == find) {
			A[i].s = replace
			if (type) A[i].type = type
		}
	}
}

function findLog(A, find) {
	for (var i = 0; i < A.length; i++) {
		if (A[i].s == find) {
			A[i].s = 'console.log('
			while (A[i] && A[i].type != 'line' && A[i].s != ';' && A[i].s != '⦙') i++
			if (!A[i]) A[i] = {type:'repl',s:')'}
			else addTo(A[i], ')')
		}
	}
}

function findStrEqu(A, sym, js) {
	// TODO: capture more than one token
	for (var i = 0; i < A.length - 1; i++) {
		if (A[i].s == sym) {
			var a = next(A, i), o = A[a]
			if (o.type == 'id' || o.type == 'num' || o.type == 'sym') {
				A[i].s = js
				o.s = '"' + o.s + '"'; i++
			} else if (o.type == 'str') {
				A[i].s = js
			}
		}
	}
}

function findLast(A) {
	for (var i = 1; i < A.length - 1; i++) {
		if (A[i].s == '↟') {
			var a = prev(A, i)
			A[a].s = '(' + A[a].s
			A[i].s = '.length - 1)'
		} else if (A[i].s == 'ꕉ') {
			var a = prev(A, i)
			A[i].s = '['+ A[a].s +'.length - 1]'
		}
	}
}
/*
➮ a (f) {}
➮ a f {}
➮ () {}
➮ {}
➮ (f) {}
*/
function findColon(A, find, replace) {
	for (var i = 0; i < A.length; i++) {
		if (A[i].s == find && ((i > 0 &&
			(A[i-1].type != 'id' && A[i-1].type != 'str')) || i == 0)) {
				A[i].s = replace+' '
				i = next(A, i)
				var ids = []
				while (A[i].type == 'id') {
					ids.push(A[i].s)
					if (ids.length > 1) A[i].s = ''
					i = next(A, i)
				}
				if (ids.length > 1) {
					ids.shift()
					var s = '(' + ids.join(',') + ')'
					addTo(A[i], s)
				} else if (A[i].s == '{') addTo(A[i], '(a,b,c)')
			}
	}
}

function handleEach(A, i) {
	var a = i
	var counter = A[prev(A, i)].s
	A[prev(A, i)].s = ''
	i++
	var R = getNameRight(A, i), array = lex.join(R[0]), i = R[1]
	for (var x = a; x < i; x++) A[x].s = ''
	A[a].s = 'for(var '+counter+' = 0; '+counter+' < '+array+'.length; '+counter+'++)'
}

function findEachs(A, f) {
	var i = next(A, 0)
	i = next(A, i)
	console.log(i)
	for (; i < A.length; i++) {
		if (A[i].s == 'each' || A[i].s == '⬌') f(A, i)
	}
}

function findVar(A) {
	for (var i = 1; i < A.length; i++) {
		if (A[i].s == '∆') {
			var q = prev(A, i)
			A[q].s = 'var '+A[q].s
			A[i].s = ' = '
		}
	}
}

//function replaceMacros(id, macro, A, i) {
	//var level = 0, e = A.length
	//while (i < e) {
		//if (A[i].s == id) {
			//A[i].s = macro
		//} else if (A[i].s == '{') level++
		//else if (A[i].s == '}') {
			//if (level == 0) return
			//level--
		//}
		//i++
	//}
//}
//
//function findMacros(A) {
	//var e = A.length
	//for (var i = 1; i < e; i++) {
		//if (A[i].s == '≞') {
			//var q = prev(A, i)
			//var id = A[q].s, macro = ''
			//A[q].s = '', A[i].s = ''
			//while (A[i].type != 'line') { macro += A[i].s; A[i].s = ''; i++ }
			//replaceMacros(id, macro, A, i)
		//}
	//}
//}
//
