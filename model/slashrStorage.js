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
			if(typeof options.url === 'object'){
				this._metadata.url = {
					file: options.url.file || "",
					image: options.url.image || ""
				};
			}
			else this._metadata.url = {
				file: options.url, 
				image: ""
			};
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
	
	async save(file, options = {}){
		// TODO What if it doesn't save on a multi disk system?
		let isSaved = true;
		for(let disk of this._metadata.disks){
			if(! await disk.save(file, options)){
				isSaved = false;
				break;
			}
		}
		return isSaved;
	}
	
	async delete(file, options = {}){
		// TODO What if it doesn't save on a multi disk system?
		let isDeleted = true;
		for(let disk of this._metadata.disks){
			if(! await disk.delete(file, options)){
				isDeleted = false;
				break;
			}
		}
		return isDeleted;
	}
	
	// Copies file into the given path
	async copy(file, localFilePath, options = {}){
		let isMoved = true;
		// TODO: For now it is going to use the first disk
		for(let disk of this._metadata.disks){
			if(await disk.copy(file, localFilePath, options)){
				return true;
			}
		}
		return false;
	}
	// Copies file into the given path
	async write(content, localFilePath, options = {}){
		// TODO: For now it is going to use the first disk
		for(let disk of this._metadata.disks){
			if(await disk.write(content, localFilePath, options)){
				return true;
			}
		}
		return false;
	}
	// Copies file into the given path
	async writeStream(stream, localFilePath, options = {}){
		// TODO: For now it is going to use the first disk
		for(let disk of this._metadata.disks){
			if(await disk.writeStream(stream, localFilePath, options)){
				return true;
			}
		}
		return false;
	}
	getFileUrlByKey(key){
		if(! key) return null;
		return this._metadata.url.file+this.getFileRelativePath(key);
	}
	getImageUrlByKey(key){
		if(! key) return null;
		return `${this._metadata.url.image}${key}`;
	}
	getFileRelativePath(id, ext){
		if(! id) return null;
		if(! ext){
			// id should be the key
			let keyVals = this.decodeFileKey(id);
			if(! keyVals || ! keyVals.i || ! keyVals.e) return false;
			id = keyVals.i;
			ext = keyVals.e;
		}
		let f1 = Math.floor(id / 10000);
		let f2 = Math.floor(id / 1000);
		let f3 = Math.floor(id / 100);
		return f1+"/"+f2+"/"+f3+"/"+id+((ext) ? "."+ext : "");
	}
	encodeFileKey(values){
		let base64url = require("base64url");
		let utils = global.slashr.utils();
		return base64url.encode(JSON.stringify(values));
	}
	decodeFileKey(key){
		let base64url = require("base64url");
		console.log("key key key",key);
		let utils = global.slashr.utils();
		return JSON.parse(base64url.decode(key));
	}
}