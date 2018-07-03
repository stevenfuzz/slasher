module.exports = class slashrDatabaseInstanceFactory{
	constructor(){
		this._metadata = {};
		this._metadata.instances = {};
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				let databaseAdapter = self._metadata.instances["default"] || self.factory("default"); 
				
				// Add to instances
				if(! self._metadata.instances["default"]) self._metadata.instances["default"] = databaseAdapter;
				
				return databaseAdapter[prop];
			},
			apply: function(obj, context, args){
				throw "Multiple instances of database N/A";
			}
		});
	}
	
	factory(key){
		let config = global.slashr.config();
		if(! config.database) throw("Database config not found.");
		switch(config.database.adapter){
			case "mysql":
				let slashrDatabaseMySqlAdapter = require("./slashrDatabaseMySqlAdapter");
				return new slashrDatabaseMySqlAdapter(config.database);
				break;
			default:
				throw("Database adapter '"+config.database.adapter+"' not found.");
		}
	}
}