module.exports = class slashrUtilities{
	constructor(){
		this.core = new slashrCoreUtilities();
		this.string = this.str = new slashrStringUtilities();
	}
}

class slashrCoreUtilities{
	getFunctionArgumentNames(func){
		let STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
		let ARGUMENT_NAMES = /([^\s,]+)/g;
		let fnStr = func.toString().replace(STRIP_COMMENTS, '');
		let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		return result || [];
	}
	getMethodArgumentNames(classObj, methodName){
		return this.getFunctionArgumentNames(classObj[methodName]);
	}
}

class slashrStringUtilities{
	toCamelCase(value){
		value = value.replace("-", " ").replace("_", " ");
		value = this.upperCaseWords(value);
		let tVals = value.split(" ");
		if(tVals.length) tVals[0] = tVals[0].toLowerCase();
		return tVals.join("");
	}
	toTitleCase(value){
		let stopWords = ['of','a','the','and','an','or','nor','but','is','if','then','else','when', 'at','from','by','on','off','for','in','out','over','to','into','with'];
		// Split the string into separate words
		words = value.split(' ');
		for(let key in words){
			// If this word is the first, or it's not one of our small words, capitalise it
			// with ucwords().
			if (key === 0 || stopWords.indexOf(words[key]) === -1) words[key] = this.upperCaseWords(words[key]);
		}
		// Join the words back into a string
		newtitle = implode(' ', words);
		return newtitle;
	}
	upperCaseWords (str) {
		return (str + '').replace(/^(.)|\s+(.)/g, function ($1) {
			return $1.toUpperCase();
		});
	}
}