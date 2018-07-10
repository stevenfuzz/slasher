const slashrStorageDisk = require("./slashrStorageDisk");
module.exports = class slashrStorageDiskLocalAdapter extends slashrStorageDisk{
	// constructor(storage, options = {}) {
	// 	super(storage, options);
	// }
	setup(options = {}){
		if(! options.path) throw("Error initializing local disk adapter. Directory path blr::PATH must be defined.");
		this._metadata.path = options.path;
	}
	async save(file, options = {}){
		let utils = global.slashr.utils();
		// TODO: Just temporary
		if(file.isNew()) throw("Error saving file to local disk. File can not be new.");
		
		let destPath = null;
		let basePath = this._metadata.path;
		let srcPath = file.getTempPath();
		let relPath = file.getRelativePath();
		
		if(! relPath) throw("Error saving file to local disk. File relative path not found.");
		//let pathInfo = pathinfo(relPath);

		let path = require("path");
		let pathInfo = {
			basename: path.basename(relPath),
			dirname: path.dirname(relPath)
		};

		if(! pathInfo.basename) throw("Error saving file to local disk. File relative path has no file name.");
		if(pathInfo.dirname == "/"){
			// Fix a filename starting with a slash
			relPath = pathInfo.basename;
		}
		else if(pathInfo.dirname != "."){
			// Make sure it exists
			// Create directories if needed
			if(pathInfo.dirname.indexOf("/") !== -1){
				let t = await utils.file.dirExists(basePath+pathInfo.dirname);
				if(! await utils.file.dirExists(basePath+pathInfo.dirname)){
					let tParts = pathInfo.dirname.split("/");
					let tPath = basePath;
					for(let f of tParts){
						tPath+=f;
						let e = await utils.file.dirExists(tPath);
						if(! await utils.file.dirExists(tPath)){
							if(! await utils.file.mkdir(tPath)) throw("Error saving file to local disk. Could not create directory '{tPath}'.");
						}
						tPath+="/";
					}
				}
			}
		}
		// Create the destination path
		destPath = basePath+relPath;

		// Copy the file
		let isSuccess = await utils.file.copy(srcPath, destPath);
		// TODO are these permissions ok?

		return isSuccess;
	}
	async delete(file, options = {}){
		let utils = global.slashr.utils();
		let path = file.getRelativePath();
		isSuccess = utils.file.unlink(path);
		return isSuccess;
	}
	async copy(file, localFilePath, options = {}){
		let utils = global.slashr.utils();
		let path = file.getRelativePath();
		return await utils.file.copy(path, localFilePath);
	}
}