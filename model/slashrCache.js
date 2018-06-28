module.exports = class slashrCache{
	
	_getValue(key, options){throw("_getValue must be defined.");}
	_setValue(key, value, minutes, options){throw("_setValue must be defined.");}
	connect(options){throw("connect must be defined.");}
	disconnect(){throw("_disconnect must be defined.");}
	isConnected(){throw("_isConnected must be defined.");}
	
	constructor(config = {}) {
		this._metadata = {
			prefix: config.prefix || "",
			errorType : config.errorType || "warning",
			connector: false,
			config : config
		};
		this.connector = this.connect(this._metadata.config);
		this.validateConnection();
	}
	
//	static factory(config = {}){
//		if(! config.adapter) throw new frak("Error with blr cache factory, no adapter given.");
//		switch(config.adapter){
//			case "redis":
//				require("./slashrCacheRedisAdapter");
//				return new slashrCacheRedisAdapter(config);
//				break;
//		}
//	}
	async get(key, options){
		if(! this.validateConnection()) return null;
		key = this.createKey(key);
		return await this.getValue(key, options);
	}
	set(key, value, time, options){
		// time will default to minutes
		// may add option to allow for differant time units
		if(! this.validateConnection()) return false;
		key = this.createKey(key);
		this.setValue(key, value, time, options);
		// Return this to chain set
		return this;
	}
	validateConnection(){
		if(! this.isConnected()){
			throw("No connection to r cache instance.", {errorType: this._metadata.errorType});
			return false;
		}
		else return true;
	}
	createKey(key){
		let md5 = require("md5");
		let nKey = "mbcache-";
		if(this._metadata.prefix) nKey += this._metadata.prefix+'-';
		nKey += key;
		return md5(key);
		return key;
	}
	getConnection(){
		return this.connector;
	}

}