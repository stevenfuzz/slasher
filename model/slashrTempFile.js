const slashrFile = require("./slashrFile");
module.exports = class slashrTempFile extends slashrFile{
	
	constructor(storage, options = {}){
		const _metadata = {};
		super(storage, options);
		this._metadata.isSaved = false;
		console.log("DEAL WITH DESCTRUCTOR");
	}
	__destruct(){
		let tmpPath = this.getTempPath();
		if(! this.isNew() && ! this.isSaved() && tmpPath){
			this.delete();
		}
	}
	async init(key, options = {}){
		this._metadata.isInitialized = false;
		let isSuccess = false;
		if(key instanceof slashrFile){
			// Create from a file
			isSuccess = this.populate(key.extract());
			
			// Create the temp file
			let tempPath = this.getTempPath();
			console.log(tempPath);
			if(key.isNew()){
				if(! tempPath){
					throw("LKJSDFLKJSDLKFJLKJSDFh");
					// Check if it has content
					let content = key.getContent();
					if(content){
						tempPath =  this._getDefaultTempPath();
						throw("SLDKFJLKSDJF LKSDJ FLKSDJ FLKDSJ FLKS DJF LKJS DLKFJ F");
						if(! await this._metadata.storage.write(tempPath,content)) throw("Unable to init slashrFile for slashrTempFile. Could not copy content info.");
						this.setTempPath(tempPath);
						throw("SLKDJF");
					}
					else throw("Unable to init slashrFile for slashrTempFile. File must have source info.");
				}
			}
			else if(! tempPath){
				tempPath =  this._getDefaultTempPath();
				// Move file over to a local version
				if(! await this._metadata.storage.copy(key, tempPath)) throw("Unable to init slashrFile for slashrTempFile. Could not copy source info.");
				this.setTempPath(tempPath);
			}
			if(! tempPath) throw("Unable to init slashrFile for slashrTempFile. Could not create temp file.");
		}
		else if(typeof key === "object"){
			// TODO: Validate values
			isSuccess = this.populate(key);
		}
		else if(!isNaN || key.indexOf){
			return this.loadById(key, options);
		}
		else throw("Unable to init temp file.");
		
		if(this.validate()){
			isSuccess = await this._createTempFile();
		}
		
		this._metadata.isInitialized = isSuccess; 
		return isSuccess;
	}
	async _loadById(id, options = {}){
		let nTmpPath = this._metadata.storage.getTempDirectory()+id+"_metadata";
		let utils = global.slashr.utils();
		if(file_exists(nTmpPath)){
			let tValues = JSON.parse(file_get_contents(nTmpPath));
			return await this.init(tValues, options);
		}
		else throw("Unable to load temp file. Temp file not found.");
		return false;
	}
	getTempPath(){
		return this._metadata.file.path;
	}
	getContent(){
		return this._metadata.file.content;
	}
	setTempPath(path){
		this._metadata.file.path = path;
		return this;
	}
	getId(){
		if(! this._metadata.file.uid){
			let uniqid = require("uniqid");
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
		if(! nFileId) return false;
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
		let nFileName = this.getTempFileName();
		if(! nFileName) return false;
		let nTmpPath = this._metadata.storage.getTempDirectory();
		return nTmpPath+nFileName;
	}
	_getDefaultMetadataTempPath(){
		// Save the file in the tmp path
		let nFileName = this.getTempMetadataFileName();
		if(! nFileName) return false;
		let nTmpPath = this._metadata.storage.getTempDirectory()		
		return nTmpPath+nFileName;
	}
	
	_createTempFile(){
		// check for error
		let tmpPath = this.getTempPath();
		// check for error
		// Check if this is an uploaded file
		if(! tmpPath){			
			let nFileName = this.getTempFileName();
			if(! nFileName) throw("Unable create temp file. No temp name found.");
			let nTmpPath = this.getDefaultTempPath();
			
			// See if this file is already a temp folder
			if(nTmpPath === tmpPath){
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
	async save(options = {}){
		// save the metadata as a file with no extension ending in _metadata
		// this makes it easy to re-initialize a tmp file
		let nMetadataFileName = this.getTempFileName();
		if(! nMetadataFileName) throw("Unable save temp file. No temp metadata name found.");
		let nTmpPath = this.getDefaultMetadataTempPath();
		if(file_put_contents(nTmpPath, JSON.stringify(this._metadata.file.toArray()))  === false) throw("Unable to init uploaded file. Unable to create file metadata in tmp directory at path '{nTmpPath}'. Please check permissions.");
		this._metadata.isSaved = true;
	}
	async delete(options = {}){
		// if(this.isNew()) return true;
		let utils = global.slashr.utils();
		let nTmpPath = this._getDefaultTempPath();

		console.log("delete tmp path",nTmpPath);
		if(await utils.file.dirExists(nTmpPath)){
			if(await utils.file.unlink(nTmpPath)) throw("Unable to delete uploaded file. Could not delete '{nTmpPath}'.");
		}
		nTmpPath =  this._getDefaultMetadataTempPath();
		if(await utils.file.dirExists(nTmpPath)){
			if(await utils.file.unlink(nTmpPath)) throw("Unable to delete uploaded file. Could not delete '{nTmpPath}'.");
		}
		this._metadata.file = {}
		this._metadata.isInitialized = false;
		return true;
	}
}