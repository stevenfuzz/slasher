module.exports = class slashrCacheInstanceFactory{
	constructor(){
		this._metadata = {};
		this._metadata.instances = {};
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				let cache = self.getInstance("default");
				return cache[prop];
			},
			apply: function(obj, context, args){
				if(args.length === 0){
					return self.getInstance("default");
				}
				throw "TODO: Multiple instances of cache N/A";
			}
		});
	}
	
	getInstance(name){
		let cacheAdapter = this._metadata.instances[name] || this.factory(name); 
		// Add to instances
		if(! this._metadata.instances[name]) this._metadata.instances[name] = cacheAdapter;
		return cacheAdapter;
	}
	
	factory(key){
		let config = global.slashr.config();
		if(! config.cache) throw("Cache config not found.");
		switch(config.cache.adapter){
			case "redis":
				let slashrCacheRedisAdapter = require("./slashrCacheRedisAdapter");
				return new slashrCacheRedisAdapter(config.cache);
				break;
			default:
				throw("Cache adapter '"+config.cache.adapter+"' not found.");
		}
	}
}