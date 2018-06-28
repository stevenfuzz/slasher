const slashrCache = require("./slashrCache");
module.exports = class slashrCacheRedisAdapter extends slashrCache{
	connect(config){
		var redis = require("redis");
				
		this._validateConnectionValues(config);

		let client = null;
		try{
			console.log("SDLKJFLSDKJFLKSJDFLJKSDFLKJSDLKJF");
			client = redis.createClient(config);
			if(! client) client = null;
			client.on("connected",()=>{
				console.log("Cache Connected");
			});
			client.on("error",(err)=>{
				console.log("Cache Error: ",err);
			});
		}
		catch(error){
			throw("Could not connect to cache. "+error.getMessage());
		}
		return client;
	}
	async getValue(key, options = {}){
		let self = this;
		let getAsync = (key, options) => {
			return new Promise(function(resolve, reject){
				console.log("Connecting to the server");
				self.getConnection().get(key, (err, reply) => {
					if(err){
						reject(err);
						return;
					}
					let value = JSON.parse(reply);
					resolve(value);
				});	
			});
		};
		
		let t =  await getAsync(key, options);
		console.log("HERE HERE HERE");
		console.log(key);
		console.log(t);

		return t;
	}
	setValue(key, value, options = {}){
		console.log("set key", key);
		console.log("set value",value);
		
		value = JSON.stringify(value);
		
		this.getConnection().set(key, value);
		if(options.cacheTime) this.getConnection().expire(key, (options.cacheTime * 60));
		return true;
	}
	isConnected(){
		let connection = this.getConnection();
		if(! connection) return false;
		else return true;
	}
	disconnect(){
		this.getConnection().quit();
	}
	_validateConnectionValues(config){
		if(! config.host) throw("Unable to connect to cache, no host found.");
		if(! config.port) throw("Unable to connect to cache, no port found.");
	}

}