module.exports = class slashrDatabase{
	constructor(config){
		console.log(config);
		if(! config.database) throw("No Database Found.");
		this._metadata = {
			database : config.database
		};
		this.connector = this.connect(config);
		
		// Create the callback for the app exiting
		let onExitCallback = (() => {
			this.disconnect();
		}).bind(this);
		global.slashr.getInstance().onExit(onExitCallback);
		
		let slashrDatabaseQueryFactory = require("./slashrDatabaseQueryFactory");
		this.query = this.qry = new slashrDatabaseQueryFactory(this);
		
	}
	
//	get query(){
//		return this._query();
//	}
//	get qry(){
//		return this._query();
//	}
//	_query(rawQuery, options){
//		console.log("query fn 1");
//	}

	connect(config){ throw "Database Error: Connect method not found in adapter."; }
	disconnect(config){ throw "Database Error: Disconnect method not found in adapter."; }
	executeQuery(query, options){ throw "Database Error: ExecuteQuery method not found in adapter."; }
	
}