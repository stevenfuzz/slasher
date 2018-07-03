class slashrStorageDiskLocalAdapter extends slashrStorageDisk{
	setup(options = {}){
		if(! options.path) throw("Error initializing local disk adapter. Directory path blr::PATH must be defined.");
		this._metadata.path = options.path;
	}
	save(file, options = {}){
		// TODO: Just temporary
		if(file.isNew()) throw("Error saving file to local disk. File can not be new.");
		
		let destPath = null;
		let basePath = this._metadata.path;
		let srcPath = file.getTempPath();
		let relPath = file.getRelativePath();
		
		if(empty(relPath)) throw("Error saving file to local disk. File relative path not found.");
		throw("GET PATH INFO AND FILE FUNCTIONS SET UP");
		let pathInfo = pathinfo(relPath);

		if(empty(pathInfo["basename"])) throw("Error saving file to local disk. File relative path has no file name.");
		if(pathInfo["dirname"] == "/"){
			// Fix a filename starting with a slash
			relPath = pathInfo["basename"];
		}
		else if(pathInfo["dirname"] != "."){
			// Make sure it exists
			// Create directories if needed
			if(strpos(pathInfo["dirname"], "/") !== false){
				if(! is_dir(basePath.pathInfo["dirname"])){
					tParts = explode("/", pathInfo["dirname"]);
					tPath = basePath;
					for(let f of tParts){
						tPath+=f;
						if(! is_dir(tPath)){
							if(! mkdir(tPath)) throw("Error saving file to local disk. Could not create directory '{tPath}'.");
						}
						tPat+="/";
					}
				}
			}
		}
		// Create the destination path
		destPath = basePath.relPath;

		// Copy the file
		isSuccess = copy(srcPath, destPath);
		// TODO are these permissions ok?

		return isSuccess;
	}
	delete(file, options = {}){
		path = this._metadata.path.file.getRelativePath();
		isSuccess = unlink(path);
		return isSuccess;
	}
	copy(file, localFilePath, options = {}){
		path = this._metadata.path.file.getRelativePath();
		return copy(path, localFilePath);
	}
}