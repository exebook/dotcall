#Dotcall
###Dotcall is a callback hell remedy.

Instead of building complex async ladders, you can write your code in a manner similar to conventional synchronous style.

The theory behind it is this:

 - Most of the time the result of an asynchronous functions is not used, and after it was called, the upper functions also exits immediately. Although sometimes the upper function can do something after it called the first `async(callback)`, usually it does nothing and returns. Sometimes the asynchronous function could return something useful, but most of the time it just returns `undefined` and the real stuff is returned with `callback(result)`.
 - When the above situation is true, the special syntax sugar can be applied.


The syntax of `dotcall` is very simple, when the call's brace is preceeded with a dot `.(`, then the call is converted (hence the name):

```javascript
var a = f.()
console.log(a)
```

Is replaced with
```javascript
f(function(DOTCALL1) { var a = DOTCALL1
    console.log(a)
})
```

In case your callback uses more than one parameter, there is an extended syntax, called **double colon** syntax.
```javascript
redis.set.('a', 12345)
redis.get.('a' :: err, data)
if (err) console.log(err)
console.log(data) // outputs 12345
```

Another case of **double colon** notation is to specify the useful argument number like this:
```javascript
redis.set.('a', 12345)
console.log(redis.get.('a' :: 2))
```
the above outputs `12345`, because Redis function `get(err, data)` uses `data` as a second parameter

### require() syntax:
```
require('dotcall')
require('./sample.dc')
```

###console invocation:
```
node .call.js sample.dc
```

###Complete minimalistic example `sample.dc`:
```javascript
function foo(f) {
	setTimeout(function() { f(true) }, 200)
}

function bar(x, f) {
	setTimeout(function() { f(500 + x) }, 200)
}

 function main() {
	if (foo.()) {
		var d = bar.(55)
		console.log(d)// outputs 555
	}
}
main()
```

###Minimalistic Redis example:
```javascript
var redis = require("redis").createClient()

function main() {
	redis.set.('a', 555)
	redis.get.('a' :: e, d)
	console.log(d)
	if (d == '555') {
		redis.set.('b', parseInt(d) + 1)
		var d = redis.get.('b' :: 2)
		console.log(d)
		redis.del.('a')
		redis.del.('b')
		redis.quit()
	} else {
		redis.quit()
	}
}

main()
```

###extension handling
By default **dotcall** require() will only handle `.dc` file extension, leaving normal `.js` intact. But if you want you can tell it to handle any extension you want like this:

```javascript
var dotcall = require('dotcall')
dotcall.handleExt('.js')
require('./sample.js') // now .js is handled with dotcall, beware
```

###files
 - .README.md - this readme
 - dotcall.js - the file you require()
 - dcconvert.js - actual conversion functions
 - sample.dc - minimalist sample
 - redis.dc - example of some calls to Redis DB
 - .call.js - console node wrapper
 - testapp.js - example of require('dotcall')
 