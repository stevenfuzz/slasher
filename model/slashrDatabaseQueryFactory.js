module.exports = class slashrDatabaseQueryFactory{
	constructor(database){
		this._metadata = {
			database: database
		};
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				let qry = self._metadata.database._getQueryFactory();
				return qry[prop];
			},
			apply: function(obj, context, args){
				if(args.length > 0){
					return self._metadata.database.executeQuery(args[0],args[1] || {});
				}
				return self._metadata.database._getQueryFactory();
			}
		});
	}
}