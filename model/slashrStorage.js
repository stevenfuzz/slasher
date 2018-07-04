module.exports = class slashrStorage{
	constructor(options) {
		this._metadata = {};
		this._init(options);
		this.setup(options);
		let slashrFileAbstractFactory = require("./slashrFileAbstractFactory");
		this.files = this.file = this.f = new slashrFileAbstractFactory(this);
	}
	
	setup(){
		// Overload	
	}
	
	_init(options = {}){
		// Get the tmpDir
		this._metadata.tmpDir = false;
		if(options.tmp){
			this._metadata.tmpDir  = options.tmp;
			delete options.tmp;
		}
		else{
			const os = require('os');
			this._metadata.tmpDir = os.tmpdir();
		} 
		
		// Get the file url
		this._metadata.url = false;
		if(options.url){
			this._metadata.url  = options.url;
			delete options.url;
		}
		
		// Get the disks
		this._metadata.disks = [];
		if(options.adapter){
			if(options.disk) throw("Unable to init storage. Both disk and adapter in config");
			options = {disk: [options]};
		}
		
		if(! options.disk)  throw("Unable to init storage. Disk not defined as an array.");
		
		for(let i in options.disk){
			let disk = options.disk[i];
			if(! disk.adapter) throw("Unable to init storage. No adapter found for disk.");
			// TODO: Make this work for custom disk types
			// Hard coded and in system for now
			switch(disk.adapter){
				case "local":
					let slashrStorageDiskLocalAdapter = require("./slashrStorageDiskLocalAdapter");
					console.log(slashrStorageDiskLocalAdapter);
					this._metadata.disks.push(new slashrStorageDiskLocalAdapter(this, disk));
					break;
				default:
					throw("Unable to init storage. Unknown adapter type: '"+disk.adapter+"'");
			}
		}
	}
	
	// createMember(name, args = {}) {
	// 	switch(name){
	// 		case "files":
	// 		case "file":
	// 		case "fl":
	// 			return new blrFileFactory(this);
	// 			break;
	// 	}
	// }
	
	getTempDirectory(){
		return this.getTmpDir();
	}
	getTmpDir(){
		return this._metadata.tmpDir;
	}
	getFileUrl(){
		return this._metadata.url;
	}
	
	save(file, options = {}){
		// TODO What if it doesn't save on a multi disk system?
		let isSaved = true;
		for(let disk of this._metadata.disks){
			if(! disk.save(file, options)){
				isSaved = false;
				break;
			}
		}
		return isSaved;
	}
	
	delete(file, options = {}){
		// TODO What if it doesn't save on a multi disk system?
		let isDeleted = true;
		for(let disk of this._metadata.disks){
			if(! disk.delete(file, options)){
				isDeleted = false;
				break;
			}
		}
		return isDeleted;
	}
	
	// Copies file into the given path
	copy(file, localFilePath, options = {}){
		let isMoved = true;
		// TODO: For now it is going to use the first disk
		for(let disk of this._metadata.disks){
			if(disk.copy(file, localFilePath, options)){
				return true;
			}
		}
		return false;
	}
}