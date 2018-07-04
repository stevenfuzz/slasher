class slashrFile{
	_metadata = {};
	__construct(storage, options = array()){
		this._metadata.storage = storage;
		this._metadata.file = {};
		this._metadata.object = {};
		this._metadata.isInitialized = false;
		this._metadata.entity = new slashrEntity("files");
		this._metadata.parent = null;
		this._metadata.isNew = true;
		this._metadata.isTmpInitialized = false;
	}

	setup(){
		// Overload	
	}

	/*
	 * Populate the metadata by array
	 */
	populate(file){

		this._metadata.object = file;

		// TODO Validate populated data
		let utils = global.slashr.utils();
		// reset the data
		this.setName(values.name);
		let name = this.getName();
		
		// Look for the true mimetype
		if(this._metadata.file.type){
			this.setType(this._metadata.file.type);
		}
		// TODO This code is pretty hacky
		if(! this._metadata.file.ext){
			let tExt = false;
			if(name){
				let tParts = name.split(".");
				if(tParts.length && tParts.length > 1){
					tExt = tParts[tParts.length - 1];
				}
			}
			let mimeType = this.getMimeType();
			if(! tExt){
				tExt = utils.file.getExtensionByMimeType(mimeType);
				this.setName(this.getName()+"."+tExt);
			}
			if(tExt && utils.file.checkExtensionByMimeType(tExt, mimeType)){
				this._metadata.file.ext = tExt;
			}
		}
		return true;
	}
	/*
	 * Returns an array of the values
	 */
	extract(){
		return this._metadata.file;
	}
	/*
	 * Validates and Creates attributes after init
	 */
	validate(){
		let mimeType = this.getMimeType();
		if(! mimeType) throw("Unable to get uploaded file extension. No mimetype '{mimeType}' found.");
		return true;	
	}
	/*
	 * Setters and Getters
	 */
	isInitialized(){
		return this._metadata.isInitialized;
	}
	getTmpPath(){
		return this.getTempPath();
	}
	getName(){
		return this._metadata.file.name;
	}
	setName(name){
		this._metadata.file.name = name;
		return this;
	}
	getType(){
		return this._metadata.file.type;
	}
	setType(type){
		this._metadata.file.type = type;
		return this;
	}
	getSize(){
		return this._metadata.file.size;
	}
	setSize(size){
		this._metadata.file.size = size;
		return this;
	}
	getMimeType(){
		return this.getType();
	}
	setMimeType(type){
		this.setType(type);
		return this;
	}
	getContent(){
		let tPath = this.getTempPath();
		if(! tPath) throw("Error getting file content. No temporary path availabile.");
		if(! file_exists(tPath)) throw("Error getting file content. No file exists at temporary path.");
		
		return file_get_contents(tPath);
	}
	setExtension(ext){
		this._metadata.file.ext = ext;
		return this;
	}
	getExtension(){
		return this._metadata.file.ext;
	}

	_initTmpFile(){
		if(this._metadata.tmpFile) return false;
		// TODO: Create temp files as a class
		this._metadata.tmpFile = this._metadata.storage.files.temp(this);
	}
	
	// Init by slashrFormUploadedFile, handle, or id
	// key mixed slashrTempFile|id|fileKey|path
	init(key, options = array()){
		if(key instanceof slashrTempFile){
			// Set the source as the uploaded file
			this._metadata.tmpFile = key;
			this.populate(this._metadata.tmpFile.extract());
		}
		else if(!isNaN(key) || (key.indexOf && key.indexOf("/") === -1 && key.indexOf(".") === false)){
			// Key or id
			let eId = null;
			if(!isNaN(key)) eId = key;
			else{
				let keyVals = this._metadata.storage.files.decodeKey(key);
				eId = ( keyVals.i) ? keyVals.i : null;
			}
			if(! eId) throw("Unable to init file by key value '{key}'.");
			this._metadata.entity.init(eId);
			if(this._metadata.entity.isNew()) throw("Unable to init file entity by key value '{key}' and id '{eId}'.");
			this.populate(this._metadata.entity.extract());
		}
		else throw("TODO: Init file by filepath");
		
		// Validate
		this.validate();
		
		return this;
	}
	
	save(options = array()){
		this._metadata.entity.populate(this._metadata.file.toArray());
		this._metadata.entity.save();

		let isSuccess = this._metadata.storage.save(this);
		
		if(isSuccess){
			if(this._metadata.source instanceof slashrTempFile){
				this._metadata.source.delete();
			}
		}
		else throw("TODO: Deal with broken file issue saving slashrFile.");

		return isSuccess;
	}
	
	delete(options = array()){
		// TODO: How will this work if the file is saved in differant places other than the current instance?
		if(this.isNew()) return false;
		if(this._metadata.storage.delete(this)){
			this._metadata.entity.delete();
			return;
		}
		return false;
	}
	
	getTempPath() {
		if(! this._metadata.tmpFile){
			this.initTmpFile();
		}
		return this._metadata.tmpFile.getTempPath();
	}
	getTempFileId() {
		if(! this._metadata.tmpFile){
			this.initTmpFile();
		}
		return this._metadata.tmpFile.getId();
	}
	getTempFile() {
		if(! this._metadata.tmpFile){
			this.initTmpFile();
		}
		return this._metadata.tmpFile;
	}
	
	/*
	 * Generates the relative path of the file based on id 
	 */
	getRelativePath(){
		if(this.isNew()) return false;
		return this._metadata.storage.files.getRelativePath(this.getId(), this.getExtension());
	}
	
	/*
	 * Validates the metadata
	 */
	validate(){
		return true;
	}
	
	/*
	 * Setters and Getters
	 */
	isNew(){
		return this._metadata.entity.isNew();
	}
	getId(){
		return this._metadata.entity.getId();
	}
	getKey(values = array()){
		if(this.isNew()) return false;
		let values = {
			i: this.getId(),
			e: this.getExtension()
		};
		return this._metadata.storage.files.encodeKey(values);
	}


}


