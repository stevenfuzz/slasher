module.exports = class slashrDatabaseQueryFactory{
	constructor(database){
		this._metadata = {
			database: database
		};
		let self = this;
		let queryFactory = this._metadata.database._getQueryFactory();
		return new Proxy(function(){}, {
			get : function(obj, prop){
				return queryFactory[prop];
			},
			apply: function(obj, context, args){
				if(args.length > 0){
					throw("ALLOW QUERY EXECUTION");
				}
				return queryFactory;
			}
		});
	}
}