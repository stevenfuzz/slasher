module.exports = class slashrFileAbstractFactory{
	constructor(storage){
		this.storage = storage;
		let self = this;
		
		return new Proxy(function(){}, {
			get : function(obj, prop){
				let file = null;
				switch(prop){
					case "temp":
					case "tmp":
						let slashrTempFile = require("./slashrTempFile");
						file = new slashrTempFile(self.storage);
						break;
					case "image":
					case "img":
						let slashrImageFile = require("./slashrImageFile");
						file = new slashrImageFile(self.storage);
						break;
					case "upload":
					case "upld":
						let slashrUploadFile = require("./slashrUploadFile");
						file = new slashrUploadFile(self.storage);
						break;
				}

				if(! file) throw("File Error: Could not find file type '"+prop+"'");
				console.log("RETURN FUNCTION TO INIT");
				return (key, options) => {
					return self.initFile(file, key, options);
				}; 
			},
			apply : async function(obj, context, args){
				let slashrFile = require("./slashrFile");
				let file = new slashrFile(self.storage);
				await file._load();
				if(args.length) await file.init(...args);
				return file;
			}
		});
	}
	async initFile(file, key, options){
		await file._load();
		await file.init(key, options);
		return file;
	}
}