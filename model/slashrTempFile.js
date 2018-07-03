module.exports = class slashrTempFile extends slashrFile{
	_metadata = {};
	constructor(storage, options = array()){
		super(storage, options);
		this._metadata.isSaved = false;
		console.log("DEAL WITH DESCTRUCTOR");
	}
	__destruct(){
		let tmpPath = this.getTempPath();
		if(! this.isNew() && ! this.isSaved() && tmpPath && file_exists(tmpPath)){
			this.delete();
		}
	}
	init(key, options = array()){
		this._metadata.isInitialized = false;
		let isSuccess = false;
		if(typeof key === "object"){
			// TODO: Validate values
			isSuccess = this.populate(key);
		}
		else if(key instanceof slashrFile){
			// Create from a file
			isSuccess = this.populate(key.extract());
			
			// Create the temp file
			let tempPath = this.getTempPath();
			if(key.isNew()){
				if(! tempPath) throw("Unable to init slashrFile for slashrTempFile. File must have source info.");
			}
			else if(empty(tempPath)){
				tempPath =  this.getDefaultTempPath();
				// Move file over to a local version
				if(! this._metadata.storage.copy(key, tempPath)) throw("Unable to init slashrFile for slashrTempFile. Could not copy source info.");
				this.setTempPath(tempPath);
			}
			if(empty(tempPath) || ! file_exists(tempPath)) throw("Unable to init slashrFile for slashrTempFile. Could not create temp file.");
		}
		else if(!isNaN || key.indexOf){
			return this.loadById(key, options);
		}
		else throw("Unable to init temp file.");
		
		if(this.validate()){
			isSuccess = this.createTempFile();
		}
		
		this._metadata.isInitialized = isSuccess; 
		return isSuccess;
	}
	_loadById(id, options = array()){
		let nTmpPath = this._metadata.storage.getTempDirectory()+id+"_metadata";
		let utils = global.slashr.utils();
		if(file_exists(nTmpPath)){
			let tValues = JSON.parse(file_get_contents(nTmpPath));
			return this.init(tValues, options);
		}
		else throw("Unable to load temp file. Temp file not found.");
		return false;
	}
	getTempPath(){
		return this._metadata.file.tmp_name;
	}
	setTempPath(path){
		this._metadata.file.tmp_name = path;
		return this;
	}
	getId(){
		if(empty(this._metadata.file.uid)){
			this._metadata.file.uid = uniqid(this.getIdPrefix())+"_"+Date.now();
		}
		return this._metadata.file.uid;
	}
	setId(uid){
		this._metadata.file.uid;
		return this;
	}
	isNew(){
		return (! this.isInitialized());
	}
	isSaved(){
		return this._metadata.isSaved;
	}
	getIdPrefix(){
		return "slashr_tf_";
	}
	getTempFileName(){
		let nFileId = this.getId();
		if(empty(nFileId)) return false;
		let ext = this.getExtension();
		let nFileName = nFileId+((ext) ? "."+ext : "");
		return nFileName;
	}

	getTempMetadataFileName(){
		let nFileId = this.getId();
		if(! nFileId) return false;
		let nFileName = nFileId+"_metadata";
		return nFileName;
	}
	
	// Creates the temp path to be used for saving / storing the file
	_getDefaultTempPath(){
		// Save the file in the tmp path
		nFileName = this.getTempFileName();
		if(empty(nFileName)) return false;
		nTmpPath = this._metadata.storage.getTempDirectory()["nFileName"];
		return nTmpPath;
	}
	_getDefaultMetadataTempPath(){
		// Save the file in the tmp path
		let nFileName = this.getTempMetadataFileName();
		if(empty(nFileName)) return false;
		let nTmpPath = this._metadata.storage.getTempDirectory()["nFileName"];
		return nTmpPath;
	}
	
	_createTempFile(){
		// check for error
		let tmpPath = this.getTempPath();
		// check for error
		// Check if this is an uploaded file
		if(! empty(tmpPath)){
			
			let nFileName = this.getTempFileName();
			if(empty(nFileName)) throw("Unable create temp file. No temp name found.");
			let nTmpPath = this.getDefaultTempPath();
			
			// See if this file is already a temp folder
			if(nTmpPath == tmpPath){
				if(! file_exists(nTmpPath)) throw("Unable load file. Unable to find temp file content.");
			}
			else if(is_uploaded_file(nTmpPath) && move_uploaded_file(tmpPath, nTmpPath) === false)  throw("Unable load uploaded file. Unable to move files to tmp directory at path '{nTmpPath}'. Please check permissions.");
			else if(copy(tmpPath, nTmpPath) === false) throw("Unable load file. Unable to move files to tmp directory at path '{nTmpPath}'. Please check permissions.");

			let name = this.getName();
			if(! name){
				this.setName(nFileName);
			}
			
			this.setTempPath(nTmpPath);
			return true;
		}
		return false;
	}
	// Saves the tmp file instead of removing it
	save(options = array()){
		// save the metadata as a file with no extension ending in _metadata
		// this makes it easy to re-initialize a tmp file
		let nMetadataFileName = this.getTempFileName();
		if(empty(nMetadataFileName)) throw("Unable save temp file. No temp metadata name found.");
		let nTmpPath = this.getDefaultMetadataTempPath();
		if(file_put_contents(nTmpPath, JSON.stringify(this._metadata.file.toArray()))  === false) throw("Unable to init uploaded file. Unable to create file metadata in tmp directory at path '{nTmpPath}'. Please check permissions.");
		this._metadata.isSaved = true;
	}
	delete(options = array()){
		if(this.isNew()) return true;
		let nTmpPath = this.getDefaultTempPath();
		if(file_exists(nTmpPath)){
			if(! unlink(nTmpPath) || file_exists(nTmpPath)) throw("Unable to delete uploaded file. Could not delete '{nTmpPath}'.");
		}
		nTmpPath =  this.getDefaultMetadataTempPath();
		if(file_exists(nTmpPath)){
			if(! unlink(nTmpPath) || file_exists(nTmpPath)) throw("Unable to delete uploaded file. Could not delete '{nTmpPath}'.");
		}
		this._metadata.file = new slashrComponentMetadata();
		this._metadata.isInitialized = false;
		return true;
	}
}