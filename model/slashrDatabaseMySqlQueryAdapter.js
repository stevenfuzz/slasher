const slashrDatabaseQuery = require("./slashrDatabaseQuery");
module.exports = class slashrDatabaseMySqlQueryAdapter extends slashrDatabaseQuery{
	
	// Abbrs
	sel(values){return this.select(values);}
	upd(table){return this.update(table);}
	ins(table){return this.insert(table);}
	frm(table){return this.from(table);}
	whr(expression){return this.where(expression);}
	jn(table, expression){return this.join(table, expression);}
	ord(values){return this.orderBy(values);}
	// Run will execute the query
	async run(options){
		options = (options) || {};
		
		// Merge given bindings
		if(options && options.bindings) this.addBindings(options.bindings);
		
		// Create the query
		let qryStr = this.toString();
		
		// Get the bindings, for insert / update bindings are created during toString
		options.bindings = this.getBindings();
		
		let rslt = await this._metadata.database.executeQuery(qryStr, options);
		
		return rslt;
	}
	
	
	toString(){
		if(! this._metadata.type) throw("Cannot run query. No query type found. Please call select, update, insert, or delete to start query.");
		let qry = "";
		let hasFrom = false;
		// Get query type
		switch(this._metadata.type){
			case 'select':
				qry = "SELECT ";
				break;
			case 'update':
				qry = "UPDATE ";
				break;
			case 'insert':
				qry = "INSERT INTO ";
				break;
			case 'delete':
				qry = "DELETE FROM ";
				break;
			default:
				throw("Cannot run query. No query type found.");
		}
		// Get the return values / update values
		switch(this._metadata.type){
			case 'select':
				let selectArr = [];
				if(! this._metadata.parts.select) selectArr.push("*");
				else{ 
					// Array, no alias
					if(Array.isArray(this._metadata.parts.select)){
						for(let i in this._metadata.parts.select){
							selectArr.push(this._metadata.parts.select[i]);
						}
					}
					// Object alias
					else if(typeof this._metadata.parts.select === "object"){
						for(let alias in this._metadata.parts.select){
							let val = this._metadata.parts.select[alias]+" AS "+alias;
							selectArr.push(val);
						}
					}
					else if(typeof this._metadata.parts.select === 'string') selectArr.push(this._metadata.parts.select);
					else throw("select values must be array or string");
				}
				
				if(selectArr.length > 0) qry += selectArr.join(", ");
				
				break;
		}
		// Parse FROM
		let fromArr = [];
		if(this._metadata.parts.from){
			for(let i in this._metadata.parts.from){
				if(! this._metadata.parts.from[i].alias) fromArr.push(this._metadata.parts.from[i].table);
				else fromArr.push(this._metadata.parts.from[i].table+" "+this._metadata.parts.from[i].alias);
			}
		}
		switch(this._metadata.type){
			case'select':
				if(! fromArr.length) throw("Cannot build query. From is required for SELECT queries.");
				qry += "\nFROM "+fromArr.join(", ");
				break;
			case 'update':
			case 'insert':
			case 'delete':
				if(! fromArr.length) throw("Cannot build query. Table is required for UPDATE / INSERT / DELETE queries.");
				else if(fromArr.length > 1) throw("Cannot build query. UPDATE / INSERT / DELETE can only be called on one table.");
				qry += fromArr.join(", ");
				break;
		}
		// Parse SET / Values
		let bindName = 'val';
		let bindCount = 0;
		let valueArr = [];
		let paramArr = [];
		let tBindName = "";
		switch(this._metadata.type){
			case 'update':
				if(! this._metadata.parts.values) throw new frak("Cannot build query. SET must be called with column name value array.");
				bindName = 'val';
				bindCount = 0;
				valueArr = [];
				for(let key in this._metadata.parts.values){
					bindCount++;
					tBindName = bindName+bindCount;
					valueArr.push(key+" = :"+tBindName);					
					this.addBinding(tBindName, this._metadata.parts.values[key]);
				}
				
				qry += "\nSET "+valueArr.join(", ");

				break;
			case 'insert':
				if(! this._metadata.parts.values) throw("Cannot build query. SET must be called with column name value array.");
				bindName = 'val';
				bindCount = 0;
				valueArr = [];
				paramArr = [];
				for(let key in this._metadata.parts.values){
					bindCount++;
					tBindName = bindName+bindCount;
					valueArr.push(":"+tBindName);
					paramArr.push(key);
					this.addBinding(tBindName, this._metadata.parts.values[key]);
				}
				qry += " ("+paramArr.join(", ")+") ";
				qry += "\nVALUES ("+valueArr.join(", ")+") ";
				break;
		}
		
		// Parse JOIN WHERE
		switch(this._metadata.type){
			case 'select':
			case 'update':
			case 'delete':
				if(this._metadata.parts.join){
					let tJoinArr = [];
					for(let key in this._metadata.parts.join){
						let value = this._metadata.parts.join[key];
						switch(value.type){
							case 'left':
								qry += "\nLEFT JOIN ";
								break;
							default:
								throw("Join type '"+value.type+"' not available.");
						}
						// Add the table
						let joinTable = false;
						for(let i in value.table){
							joinTable = (value.table[i].alias) ? value.table[i].table + " " + value.table[i].alias : value.table[i].table;
							break;
						}
						
						if(! joinTable) throw("Join table not found for SQL Join");
						
						// Add the on predicate
						qry += joinTable+" ON "+this._expressionToString(value.expression);
					}
					
				}
				if(this._metadata.parts.where){
					let whereStr = this._expressionToString(this._metadata.parts.where);
					if(whereStr && whereStr != "") qry += "\nWHERE "+whereStr;
				}
				break;
		}
		
		// Order by
		switch(this._metadata.type){
			case 'select':
				if(this._metadata.parts.orderBy){
					let orderByArr = [];
					for(let col in this._metadata.parts.orderBy){
						let dir = this._metadata.parts.orderBy[col].toUpperCase();
						switch(dir){
							case "ASC_NULLS_LAST":
								dir = "ASC"
								orderByArr.push("ISNULL("+col+") "+dir);
								break;
							case "ASC_NULLS_FIRST":
								dir = "DESC";
								orderByArr.push("ISNULL("+col+") "+dir);
								break;
							case "ASC":
							case "DESC":
								// Do Nothing
								break;
							default:
								throw ("MySql order by direction '"+dir+"' not found.");
						}
						orderByArr.push(col +" "+dir);
					}
					if(orderByArr.length) qry += "\nORDER BY "+orderByArr.join(", ");
				}
				break;
		}

		return qry;
	}
	select(values){
		this._metadata.type = 'select';
		this._metadata.parts.select = values;
		return this;
	}
	orderBy(values){
		this._metadata.type = 'select';
		this._metadata.parts.orderBy = values;
		return this;
	}
	update(table, alias){
		this._metadata.type = 'update';
		this._metadata.parts.from = this._parseParameterTable(table, alias);
		return this;
	}
	
	insert(table, alias){
		this._metadata.type = 'insert';
		this._metadata.parts.from = this._parseParameterTable(table, alias);
		return this;
	}
	// Can add from to delete, or add with from
	delete(table, alias){
		this._metadata.type = 'delete';
		if(table) this._metadata.parts.from = this._parseParameterTable(table, alias);
		return this;
	}
	from(table, alias){
		this._metadata.parts.from = this._parseParameterTable(table, alias);
		return this;
	}
	where(expression){
		this._metadata.parts.where = expression;
		return this;
	}
	join(table, alias, expression){
		if(! expression){
			expression = alias;
			alias = false;
		}
		table = this._parseParameterTable(table, alias);
		return this;
	}
	leftJoin(table, alias, expression){
		if(! expression){
			expression = alias;
			alias = false;
		}
	
		if(! this._metadata.parts.join) this._metadata.parts.join = [];
		
		this._metadata.parts.join.push({
			type: "left",
			expression: expression,
			table: this._parseParameterTable(table, alias)
		});
		
		return this;
	}
	set(values){
		if(this._metadata.type != 'update') throw("Set can only be called on update queries.");
		this._metadata.parts.values = values;
		return this;
	}
	values(values){
		if(this._metadata.type != 'insert') throw("Values can only be called on insert queries.");
		this._metadata.parts.values = values;
		return this;
	}
	_parseParameterTable(table, alias){
		let ret = [];
		if(typeof table === 'object'){
			for(let alias in table){
				ret.push({
					alias: alias,
					table: table[alias]
				});
				break;
			}
		}
		else{
			ret.push({
				table: table,
				alias: alias || null
			});
		}
		return ret;
	}
	_expressionToString(expression){
		let mysql = require('mysql');
		let slashrDatabaseQueryExpression = require("./slashrDatabaseQueryExpression");
		if(expression instanceof slashrDatabaseQueryExpression){
			return expression.toString();
		}
		else if(typeof expression === "string") return expression;
		else if(typeof expression !== "object") throw new frak("Expression must be expression, string, or name/value array");
		
		// Get the bindings to check for syntax
		let bindings = this.getBindings();
		
		// simple for now
		let tPredicateArr = [];
		for(let key in expression){
			
			// check if bindings
			let op = "=";
			let value = expression[key];
			if(typeof expression[key] === 'string' && value.startsWith(":")){
				let tBind = value.slice(1, value.length).trim();
				if(bindings[tBind] === undefined) throw("Could not find bind variable '"+value+"'.");
				if(bindings[tBind] === null){
					op = "IS";
				}
			}
			else value = mysql.escape(value);
			tPredicateArr.push(key+" "+op+" "+value);
		}
		return tPredicateArr.join(" AND ");
	}
}