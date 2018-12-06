const slashrFile = require("./slashrFile");
module.exports = class slashrImageFile extends slashrFile{
	async init(key, options = {}){
		await super.init(key, options);
		await this._initImage();
	}
	setup(options = {}){
		this.TYPE_JPEG = "image/jpeg";
		this.TYPE_PNG = "image/png";
		this.TYPE_GIF = "image/gif";
		this.FIT_COVER = "cover";
		this.FIT_CONTAIN = "contain";
		this.FIT_INSIDE = "inside";
		this.FIT_OUTSIDE = "outside";
		this._metadata.image = null;
		this._metadata.isImageInitialized = false;
	}
	
	async save(options = {}){
		if(this._isImageInitialized()){
			let utils = global.slashr.utils();
			let tmpPath = this.getTempPath();
			if(! tmpPath) throw("Unable to init image file. No source path found.");

			// Remove the temp file
			// await utils.file.unlink(tmpPath);

			let metadata = await this._metadata.image.metadata();
			console.log("metadata",metadata);

			// Output the image
			await this._metadata.image.toFile(tmpPath+".tmp");
			await utils.file.copy(tmpPath+".tmp", tmpPath);
			await utils.file.unlink(tmpPath+".tmp");

			let size = await utils.file.size(tmpPath);
			
			// TODO: Fix this so it doesn't eat membory
			this.setSize(size);
			this.setMimeType(utils.file.getMimeTypeByExtension(metadata.format));
			//this.setExtension(metadata.format);
			
		}
		await super.save(options);
	}
	
	_isImageInitialized(){
		return this._metadata.isImageInitialized;
	}
	async _initImage(){
		let sharp = require("sharp");
		await this._initTmpFile();
		let tmpPath = this.getTempPath();
		if(! tmpPath) throw("Unable to init image file. No source path found.");
		this._metadata.image = sharp(tmpPath);
		this._metadata.isImageInitialized = true;
	}

	
	/*
	 * 
	 * Scales image to the desired size
	 * Leave to 0 for auto
	 * 
	 */
	async scale(w = 0, h = 0, options = {}){
		if(! h && ! w) throw("Unable to resize image, either height or width should be given.");
		//if(! this._isImageInitialized()) await this._initImage();
		this._metadata.image.resize(w, h, options);
		return this;
	}
	
	async resize(w = 0, h = 0, options = {}){
		return this.scale(w, h, options);
	}
	// Refer to sharp for options
	async convert(type,options={}){
		let utils = global.slashr.utils();
		//if(! this._isImageInitialized()) await this._initImage();
		switch(type){
			case this.TYPE_JPEG:
				this._metadata.image.jpeg(options);
			break;
			case this.TYPE_PNG:
				this._metadata.image.png(options);
			break;
			default:
				throw(`Image Conver Error: Unable to conver to type ${type}`);
		}
		this.setType(type);
		this.setExtension(utils.file.getExtensionByMimeType(type));
	}
	/*
	 * 
	 * Scales image to the desired size
	 * Leave to 0 for auto
	 * Uses Image Magik to create a smaller sized image with let profile data
	 * Sets to best fit by default
	 * 
	 */
	thumbnail(w = 0, h = 0, options = {}){
		throw("todo");
		if(! h && ! w) throw("Unable to resize image to thumbnail, either height or width should be given.");
		if(! this.isImageInitialized()) this.initImage();
		let doFit = (options.fit || options.contain) ? true : false;
		doFill = options.fill || false;
		doCover = options.cover || false;
		if(doCover){
			this._metadata.image.cropThumbnailImage(w, h);
		}
		else this._metadata.image.thumbnailImage(w, h, doFit, doFill);
		
		return this;
	}
		
}