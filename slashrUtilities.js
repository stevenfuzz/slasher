module.exports = class slashrUtilities{
	constructor(){
		this.core = new slashrCoreUtilities();
		this.string = this.str = new slashrStringUtilities();
		this.file = new slashrFileUtilities();
		this.url = new slashrUrlUtilities();
	}
}

class slashrCoreUtilities{
	getFunctionArgumentNames(func){
		let STRIP_COMMENTS = /(\/\/.*)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
		let ARGUMENT_NAMES = /([^\s,]+)/g;
		let fnStr = func.toString().replace(STRIP_COMMENTS, '');
		let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		return result || [];
	}
	getMethodArgumentNames(classObj, methodName){
		return this.getFunctionArgumentNames(classObj[methodName]);
	}
}

class slashrUrlUtilities{
	isValid(url){
		let r =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		return (r.test(url)) ? true : false;
	}
}

class slashrStringUtilities{
	toCamelCase(value){
		value = this.toSlug(value);
		value = value.replace(/-/g, " ").replace(/_/g, " ");
		value = this.toUpperCaseWords(value);
		
		let tVals = value.split(" ");
		if(tVals.length) tVals[0] = tVals[0].toLowerCase();
		return tVals.join("");
	}
	toTitleCase(value){
		let stopWords = ['of','a','the','and','an','or','nor','but','is','if','then','else','when', 'at','from','by','on','off','for','in','out','over','to','into','with'];
		// Split the string into separate words
		let words = value.split(' ');
		for(let key in words){
			// If this word is the first, or it's not one of our small words, capitalise it
			// with ucwords().
			if (key === 0 || stopWords.indexOf(words[key]) === -1) words[key] = this.toUpperCaseWords(words[key]);
		}
		// Join the words back into a string
		newtitle = words.join(' ');
		return newtitle;
	}
	toUpperCaseWords (str) {
		return (str + '').replace(/^(.)|\s+(.)/g, function (w) {
			return w.toUpperCase();
		});
	}
	toAlphanumeric(str,replaceWith=''){
		return str.replace(/[^0-9a-z ]/gi, replaceWith)
		.replace(/^-+/, '') 
		.replace(/-+$/, '');
	}
	toSlug(str){
		// str = this.toTitleCase(str);
		return str.toLowerCase()
		.replace(/[^\w\-]+/g, ' ')       // Remove all non-word chars
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/\-\-+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '');            // Trim - from end of text
	}
	slugify(txt = "") {
		if(! txt) return "";
		let slug = txt.toString().trim().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
		
		let slugArr = [];
		let len = 0;
		slug.split("-").forEach((val)=>{
			if(len + val.length < 60){
				slugArr.push(val);
				len += val.length;
			} 
		});
		return slugArr.join("-");
	}
	capitalize(w){
		return w.replace(/^\w/, w => w.toUpperCase());
	}

	uncapitalize(w){
		return w.replace(/^\w/, w => w.toLowerCase());
	}
	replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	};
	
}

class slashrFileUtilities{

	async isDir(dir){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.stat(dir, function(err, stats) {
			if (err) {
				if(err.code === 'ENOENT') resolve(false);
				else reject(err);
			}
			else resolve(true);
			});
		});
	}
	async dirExists(dir){ return this.isDir(dir); }

	async mkdir(dir){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.mkdir(dir, function(err) {
				if(err) reject(err);
				else resolve(true);
			});
		});
	}

	async size(path){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.stat(path, function(err, stats) {
				if(err) reject(err);
				else resolve(stats.size);
			});
		});
	}

	async copy(src, dest){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.copyFile(src, dest, function(err) {
				if(err) reject(err);
				else resolve(true);
			});
		});
	}

	async write(path, content){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			console.log("write file",path, content);
			fs.writeFile(path, content, 'binary',function (err) {
				if (err) reject(err);
				else resolve(true);
			});
		});
	}

	async writeStream(path, stream){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			stream.pipe(fs.createWriteStream(path));
			stream.on("error", (err) => {
				reject(err);
			});
			stream.on("end", function() {
				resolve(true);
			});
		});  
	}

	

	async unlink(path){
		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.unlink(path, function(err) {
				if(err) reject(err);
				else resolve(true);
			});
		});
	}

	async toString(path, options = {}){

		let fs = require("fs");
		return new Promise((resolve, reject) => {
			fs.readFile(path, options, function(err, data) {
				if(err) reject(err);
				else resolve(data.toString());
			});
		});
	}

	// Returns an associative arrow of mime types by extension
	// If an extenstion has multiple mime types they will be returned
	getMimeTypesByExtension(){
		return {
			'ai' : 'application/postscript',
			'aif' : 'audio/x-aiff',
			'aifc' : 'audio/x-aiff',
			'aiff' : 'audio/x-aiff',
			'asc' : 'text/plain',
			'atom' : 'application/atom+xml',
			'atom' : 'application/atom+xml',
			'au' : 'audio/basic',
			'avi' : 'video/x-msvideo',
			'bcpio' : 'application/x-bcpio',
			'bin' : 'application/octet-stream',
			'bmp' : 'image/bmp',
			'cdf' : 'application/x-netcdf',
			'cgm' : 'image/cgm',
			'class' : 'application/octet-stream',
			'cpio' : 'application/x-cpio',
			'cpt' : 'application/mac-compactpro',
			'csh' : 'application/x-csh',
			'css' : 'text/css',
			'csv' : 'text/csv',
			'dcr' : 'application/x-director',
			'dir' : 'application/x-director',
			'djv' : 'image/vnd.djvu',
			'djvu' : 'image/vnd.djvu',
			'dll' : 'application/octet-stream',
			'dmg' : 'application/octet-stream',
			'dms' : 'application/octet-stream',
			'doc' : 'application/msword',
			'dtd' : 'application/xml-dtd',
			'dvi' : 'application/x-dvi',
			'dxr' : 'application/x-director',
			'eps' : 'application/postscript',
			'etx' : 'text/x-setext',
			'exe' : 'application/octet-stream',
			'ez' : 'application/andrew-inset',
			'gif' : 'image/gif',
			'gram' : 'application/srgs',
			'grxml' : 'application/srgs+xml',
			'gtar' : 'application/x-gtar',
			'hdf' : 'application/x-hdf',
			'hqx' : 'application/mac-binhex40',
			'htm' : 'text/html',
			'html' : 'text/html',
			'ice' : 'x-conference/x-cooltalk',
			'ico' : 'image/x-icon',
			'ics' : 'text/calendar',
			'ief' : 'image/ief',
			'ifb' : 'text/calendar',
			'iges' : 'model/iges',
			'igs' : 'model/iges',
			'jpe' : 'image/jpeg',
			'jpeg' : 'image/jpeg',
			'jpg' : 'image/jpeg',
			'js' : 'application/x-javascript',
			'json' : 'application/json',
			'kar' : 'audio/midi',
			'latex' : 'application/x-latex',
			'lha' : 'application/octet-stream',
			'lzh' : 'application/octet-stream',
			'm3u' : 'audio/x-mpegurl',
			'man' : 'application/x-troff-man',
			'mathml' : 'application/mathml+xml',
			'me' : 'application/x-troff-me',
			'mesh' : 'model/mesh',
			'mid' : 'audio/midi',
			'midi' : 'audio/midi',
			'mif' : 'application/vnd.mif',
			'mov' : 'video/quicktime',
			'movie' : 'video/x-sgi-movie',
			'mp3' : 'audio/mpeg',
			'mpeg' : 'video/mpeg',
			'mpg' : 'video/mpeg',
			'ms' : 'application/x-troff-ms',
			'msh' : 'model/mesh',
			'mxu' : 'video/vnd.mpegurl',
			'nc' : 'application/x-netcdf',
			'oda' : 'application/oda',
			'ogg' : 'application/ogg',
			'pbm' : 'image/x-portable-bitmap',
			'pdb' : 'chemical/x-pdb',
			'pdf' : 'application/pdf',
			'pgm' : 'image/x-portable-graymap',
			'pgn' : 'application/x-chess-pgn',
			'png' : 'image/png',
			'pnm' : 'image/x-portable-anymap',
			'ppm' : 'image/x-portable-pixmap',
			'ppt' : 'application/vnd.ms-powerpoint',
			'ps' : 'application/postscript',
			'qt' : 'video/quicktime',
			'ra' : 'audio/x-pn-realaudio',
			'ram' : 'audio/x-pn-realaudio',
			'ras' : 'image/x-cmu-raster',
			'rdf' : 'application/rdf+xml',
			'rgb' : 'image/x-rgb',
			'rm' : 'application/vnd.rn-realmedia',
			'roff' : 'application/x-troff',
			'rss' : 'application/rss+xml',
			'rtf' : 'text/rtf',
			'rtx' : 'text/richtext',
			'sgm' : 'text/sgml',
			'sgml' : 'text/sgml',
			'sh' : 'application/x-sh',
			'shar' : 'application/x-shar',
			'silo' : 'model/mesh',
			'sit' : 'application/x-stuffit',
			'skd' : 'application/x-koan',
			'skm' : 'application/x-koan',
			'skp' : 'application/x-koan',
			'skt' : 'application/x-koan',
			'smi' : 'application/smil',
			'smil' : 'application/smil',
			'snd' : 'audio/basic',
			'so' : 'application/octet-stream',
			'spl' : 'application/x-futuresplash',
			'src' : 'application/x-wais-source',
			'sv4cpio' : 'application/x-sv4cpio',
			'sv4crc' : 'application/x-sv4crc',
			'svg' : 'image/svg+xml',
			'svgz' : 'image/svg+xml',
			'swf' : 'application/x-shockwave-flash',
			't' : 'application/x-troff',
			'tar' : 'application/x-tar',
			'tcl' : 'application/x-tcl',
			'tex' : 'application/x-tex',
			'texi' : 'application/x-texinfo',
			'texinfo' : 'application/x-texinfo',
			'tif' : 'image/tiff',
			'tiff' : 'image/tiff',
			'tr' : 'application/x-troff',
			'tsv' : 'text/tab-separated-values',
			'txt' : 'text/plain',
			'ustar' : 'application/x-ustar',
			'vcd' : 'application/x-cdlink',
			'vrml' : 'model/vrml',
			'vxml' : 'application/voicexml+xml',
			'wav' : 'audio/x-wav',
			'wbmp' : 'image/vnd.wap.wbmp',
			'wbxml' : 'application/vnd.wap.wbxml',
			'wml' : 'text/vnd.wap.wml',
			'wmlc' : 'application/vnd.wap.wmlc',
			'wmls' : 'text/vnd.wap.wmlscript',
			'wmlsc' : 'application/vnd.wap.wmlscriptc',
			'wrl' : 'model/vrml',
			'xbm' : 'image/x-xbitmap',
			'xht' : 'application/xhtml+xml',
			'xhtml' : 'application/xhtml+xml',
			'xls' : 'application/vnd.ms-excel',
			'xml' : 'application/xml',
			'xpm' : 'image/x-xpixmap',
			'xsl' : 'application/xml',
			'xslt' : 'application/xslt+xml',
			'xul' : 'application/vnd.mozilla.xul+xml',
			'xwd' : 'image/x-xwindowdump',
			'xyz' : 'chemical/x-xyz',
			'zip' : 'application/zip'
		};
	}
	getExtensionsByMimeType(){
		let exts = this.getMimeTypesByExtension();
		let ret = {};
		for(let i in exts){
			ret[exts[i]] = i;
		}
		return ret;
	}
	checkExtensionByMimeType(ext, mimeType){
		ext = ext.toLowerCase();
		let exts = this.getMimeTypesByExtension();
		if(exts[ext]){
			let type = exts[ext];
			return (type === mimeType);
		}
		return false;
	}
	getExtensionByMimeType(type){
		type = type.toLowerCase();
		let types = this.getExtensionsByMimeType();
		return types[type] || false;
	}
	getMimeTypeByExtension(ext){
		ext = ext.toLowerCase();
		let exts = this.getMimeTypesByExtension();
		return exts[ext] || false;
	}
	getUploadErrorMessageByCode(code){
		return "Unknown Upload Error. Todo: Add Codes.";
		// switch (code) {
		// 	case UPLOAD_ERR_INI_SIZE:
		// 		message = "The uploaded file exceeds the upload_max_filesize directive in php.ini";
		// 		break;
		// 	case UPLOAD_ERR_FORM_SIZE:
		// 		message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
		// 		break;
		// 	case UPLOAD_ERR_PARTIAL:
		// 		message = "The uploaded file was only partially uploaded";
		// 		break;
		// 	case UPLOAD_ERR_NO_FILE:
		// 		message = "No file was uploaded";
		// 		break;
		// 	case UPLOAD_ERR_NO_TMP_DIR:
		// 		message = "Missing a temporary folder";
		// 		break;
		// 	case UPLOAD_ERR_CANT_WRITE:
		// 		message = "Failed to write file to disk";
		// 		break;
		// 	case UPLOAD_ERR_EXTENSION:
		// 		message = "File upload stopped by extension";
		// 		break;
		// 	default:
		// 		message = "Unknown upload error";
		// 		break;
		// }
		// return message;
	}
	
}