const slashrStorage = require("./slashrStorage");
module.exports = class slashrStorageInstanceFactory{
	constructor(){
		this._metadata = {};
		this._metadata.instances = {};
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				let stor = self.getInstance("default");
				return stor[prop];
			},
			apply: function(obj, context, args){
				if(args.length === 0){
					return self.getInstance("default");
				}
				throw "TODO: Multiple instances of Storage N/A";
			}
		});
	}
	
	getInstance(name){
		let storAdapter = this._metadata.instances[name] || this.factory(name); 
		// Add to instances
		if(! this._metadata.instances[name]) this._metadata.instances[name] = storAdapter;
		return storAdapter;
	}
	
	factory(key){
		let conf = global.slashr.config();
		if(! conf.storage) throw("Storage config not found.");
		let storConf = conf.storage;
		// Check for multiple
		if(storConf.default){
			if(! storConf[key]) return null;
			storConf = storConf[key];
		}
		else if(key != 'default') return null;
		
		return new slashrStorage(storConf);
	}
}