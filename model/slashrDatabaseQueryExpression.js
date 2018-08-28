module.exports = class slahsrDatabaseQueryExpression{
	constructor(database){
		this._metadata = {
			database: database,
			parts: []
		}

	}
	toString(options){throw("database expression error, must define toString");}
	static factory(database){
		let adapter = database.getAdapter();
		if(! adapter) throw("Error with slashr database query expression factory, no adapter given.");
		switch(adapter){
			case "mysql":
				return new slashrDatabaseQueryExpressionMySqlAdapter(this._metadata.database);
				break;
			default:
				throw new frak("Database query expression adapter for '"+adapter+"' not found.");
		}
	}
	addPart(expression, type = "and"){
		let part = {
			type: type,
			expression: expression,
		};
		this._metadata.parts.push(part);
	}
	get parts(){
		return this._metadata.parts;
	}
	isEmpty(){
		return (this._metadata.parts.length);
	}
	getExpressionCount(){
		return this._metadata.parts.length;
	}
}