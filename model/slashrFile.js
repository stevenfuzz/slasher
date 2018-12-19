module.exports = class slashrFile{
	
	constructor(storage, options = {}){
		this._metadata = {};
		this._metadata.storage = storage;
		this._metadata.file = {};
		this._metadata.isInitialized = false;
		this._metadata.parent = null;
		this._metadata.isNew = true;
		this._metadata.isTmpInitialized = false;
		this.setup();
	}

	async _load(){
		let slashrEntity = require("./slashrEntity");
		this._metadata.entity = new slashrEntity("files");
		await this._metadata.entity._load();
	}

	setup(){
		// Overload	
	}

	// Init by slashrFormUploadedFile, handle, or id
	// key mixed slashrTempFile|id|fileKey|path
	async init(key, options = {}){
		const slashrTempFile = require("./slashrTempFile");

		let utils = global.slashr.utils();;
		if(! key){
			throw("File init error: No Key");
		}
		else if(key instanceof slashrTempFile){
			// Set the source as the uploaded file
			this._metadata.tmpFile = key;
			this.populate(this._metadata.tmpFile.extract());
		}
		// Check for an uploaded file
		else if(key && key.constructor && key.constructor.name === "File"){
			this.populate(key);
			await this._initTmpFile();
		}
		else if(!isNaN(key) || (key.indexOf && key.indexOf("/") === -1 && key.indexOf(".") === -1)){
			// Key or id
			let eId = null;
			if(!isNaN(key)) eId = key;
			else{
				let keyVals = this._metadata.storage.decodeFileKey(key);
				eId = ( keyVals.i) ? keyVals.i : null;
			}
			if(! eId) throw("Unable to init file by key value '{key}'.");
			await this._metadata.entity.init(eId);
			if(this._metadata.entity.isNew()) throw("Unable to init file entity by key value '{key}' and id '{eId}'.");
			this.populate(this._metadata.entity.extract());
		}
		else{
			if(utils.url.isValid(key)){
				const axios = require("axios");
				const fs = require('fs');
				let res = await axios({
					method:'get',
					url:key,
					responseType:'stream'
				});
				if(! res.headers["content-type"]) throw("File init error: No content type found.");
				if(! res.headers["content-length"]) throw("File init error: Unknown file size.");

				let uniqid = require("uniqid");
				let ext = utils.file.getExtensionByMimeType(res.headers["content-type"]); 
				if(! ext) throw("File init error: Unknown file type.");
				let file = {
					name: `${uniqid("fl_"+Date.now())}.${ext}`,
					size: res.headers["content-length"],
					type: res.headers["content-type"],
					stream: res.data
				}
				this.populate(file);
				await this._initTmpFile();
			}
			else throw("INIT IMAGE BY FILEPATH!!!!!!!!!");
		}
		
		// Validate
		this.validate();
		return this;
	}

	/*
	 * Populate the metadata by array
	 */
	populate(file){
		this._metadata.file = file;

		if(! file.name) throw("File Error: No File Name");
		if(! file.size) throw("File Error: No File Size");
		if(! file.type) throw("File Error: No File Type");
		// if(! file.path) throw("File Error: No File Path");

		// this._metadata.file.name = file.name;
		// this._metadata.file.type = file.type;
		// this._metadata.file.size = file.size;
		this._metadata.file.path = file.path || null;
		if(file.stream) this._metadata.file.stream = file.stream;

		// TODO Validate populated data
		let utils = global.slashr.utils();

		// reset the data
		this.setName(file.name);
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
	get name(){
		return this.getName();
	}
	set name(name){
		this.setName(name);
		return this;
	}
	getType(){
		return this._metadata.file.type;
	}
	setType(type){
		this._metadata.file.type = type;
		return this;
	}
	get type(){
		return this.getType();
	}
	set type(type){
		this.setType(size);
		return this;
	}
	getStream(){
		return this._metadata.file.stream;
	}
	setStream(stream){
		this._metadata.file.stream = stream;
		return this;
	}
	get stream(){
		return this.getStream();
	}
	set stream(stream){
		this.setStream(stream);
		return this;
	}
	getMetadata(){
		return this._metadata.file.metadata;
	}
	setMetadata(metadata){
		this._metadata.file.metadata = metadata;
		return this;
	}
	get metadata(){
		return this.getMetadata();
	}
	set metadata(metadata){
		this.setMetadata(metadata);
		return this;
	}
	getSize(){
		return this._metadata.file.size;
	}
	setSize(size){
		this._metadata.file.size = size;
		return this;
	}
	get size(){
		return this.getSize();
	}
	set size(size){
		this.setSize(size);
		return this;
	}
	getMimeType(){
		return this.getType();
	}
	setMimeType(type){
		this.setType(type);
		return this;
	}
	get mimeType(){
		return this.getMimeType();
	}
	set mimeType(type){
		this.setMimeType(type);
		return this;
	}
	getContent(){
		let tPath = this.getTempPath();
		if(! tPath) throw("Error getting file content. No temporary path availabile.");
		if(! file_exists(tPath)) throw("Error getting file content. No file exists at temporary path.");
		
		return file_get_contents(tPath);
	}
	get content(){
		return this.getContent();
	}
	setExtension(ext){
		this._metadata.file.ext = ext;
		return this;
	}
	getExtension(){
		return this._metadata.file.ext;
	}
	get extension(){
		return this.getExtension();
	}
	set extension(ext){
		this.setExtension(ext);
		return this;
	}

	async _initTmpFile(){
		if(this._metadata.tmpFile) return false;
		this._metadata.tmpFile = await this._metadata.storage.files.temp(this);
	}
	
	
	async save(options = {}){
		await this._metadata.entity.populate(this._metadata.file);
		await this._metadata.entity.save();

		let isSuccess = await this._metadata.storage.save(this);
		
		if(isSuccess){
			// let slashrTempFile = require("./slashrTempFile");
			// if(this._metadata.tmpFile instanceof slashrTempFile){
			// 	await this._metadata.tmpFile.delete();
			// }
		}
		else throw("TODO: Deal with broken file issue saving slashrFile.");

		return isSuccess;
	}
	
	delete(options = {}){
		// TODO: How will this work if the file is saved in differant places other than the current instance?
		if(this.isNew()) return false;
		if(this._metadata.storage.delete(this)){
			this._metadata.entity.delete();
			return;
		}
		return false;
	}
	
	getTempPath() {
		if(! this._metadata.tmpFile) throw("File Error: Temp file not initialized.");
		return this._metadata.tmpFile.getTempPath();
	}
	getTempFileId() {
		if(! this._metadata.tmpFile) throw("File Error: Temp file not initialized.");
		return this._metadata.tmpFile.getId();
	}
	getTempFile() {
		if(! this._metadata.tmpFile) throw("File Error: Temp file not initialized.");
		return this._metadata.tmpFile;
	}
	
	/*
	 * Generates the relative path of the file based on id 
	 */
	getRelativePath(){
		if(this.isNew()) return false;
		return this._metadata.storage.getFileRelativePath(this.getId(), this.getExtension());
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
	getKey(){
		if(this.isNew()) return false;
		let values = {
			i: this.getId(),
			e: this.getExtension()
		};
		return this._metadata.storage.encodeFileKey(values);
	}
	get key(){
		return this.getKey();
	}
	set key(key){throw("File Key Cannot be Set.");}


}


