const slashrFile = require("./slashrFile");
module.exports = class slashrImageFile extends slashrFile{
	
	setup(options = array()){
		this._metadata.image = null;
		this._metadata.isImageInitialized = false;
	}
	
	save(options = array()){
		if(this.isImageInitialized()){
			let utils = global.slashr.utils();
			tmpPath = this.getTempPath();
			if(empty(tmpPath)) throw("Unable to init image file. No source path found.");
			this._metadata.image.writeImage(tmpPath);

			// TODO: Fix this so it doesn't eat membory
			this.setSize(strlen(this._metadata.image.getImageBlob()));
			this.setMimeType(this._metadata.image.getImageMimeType());
			this.setExtension(utils.file.getExtensionByMimeType(this.getMimeType()));
			
		}
		super.save(options);
	}
	
	_isImageInitialized(){
		return this._metadata.isImageInitialized;
	}
	_initImage(){
		this._metadata.isImageInitialized = true;
		let tmpPath = this.getTempPath();
		if(! tmpPath) throw("Unable to init image file. No source path found.");
		this._metadata.image = new Imagick(tmpPath);
	}
	
	/*
	 * 
	 * Scales image to the desired size
	 * Leave to 0 for auto
	 * 
	 */
	scale(w = 0, h = 0, options = {}){
		if(! h && ! w) throw("Unable to resize image, either height or width should be given.");
		if(! this.isImageInitialized()) this.initImage();
		let doFit = (options.fit || options.contain) ? true : false;
		this._metadata.image.resizeImage(w, h, "imagick::FILTER_UNDEFINED", 1, doFit);
		return this;
	}
	resize(w = 0, h = 0, options = {}){
		return this.scale(w, h, options);
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