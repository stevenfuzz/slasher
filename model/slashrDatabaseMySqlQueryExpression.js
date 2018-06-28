const slashrDatabaseMySqlQueryExpression = require("./slashrDatabaseQueryExpression");
module.exports = class slashrDatabaseMySqlQueryExpression extends{

// PROXY
//	final public function __call($name, $arguments){
//		$utils = blr::utils();
//		$name = strtolower(trim($name));
//		if ($name == 'or' || $name == 'and' || $name == 'if'){
//			$fn = "{$name}X";
//			return call_user_func_array([$this,$fn], $arguments);
//		}
//		else if($utils->string->startsWith($name,"or")){
//			$fn = $utils->string->toCamelCase(substr($name, 2));
//			return $this->or(call_user_func_array([$this->db->qry->exp,$fn], $arguments));
//		}
//		else if($utils->string->startsWith($name,"and")){
//			$fn = $utils->string->toCamelCase(substr($name, 3));
//			return call_user_func_array([$this,$fn], $arguments);
//		}
//		else{
//			throw new frak("blrDatabaseQueryExpressionSqlAdapter method '{$name}' not found.");
//		}
//	}

	// orX and andX use __call for or / and
//	abstract function orX(expression);
//	abstract function andX(expression);
//	abstract function equals(x,y);
//	abstract function notEquals(x,y);
//	abstract function lessThan(x,y);
//	abstract function lessThanOrEquals(x,y);
//	abstract function greaterThan(x,y);
//	abstract function greaterThanOrEquals(x,y);
//	abstract function in(x,y);
//	abstract function notIn(x,y);
//	abstract function exists(x);
//	abstract function notExists(x);
//	abstract function isNull(x);
//	abstract function isNotNull(x);
//	abstract function like(x,y);
//	abstract function notLike(x,y);
//	
//	abstract function min(x);
//	abstract function max(x);
//	abstract function count(x);
//	abstract function countDistinct(x);
//	abstract function ifX(x, y, z);
	
	// Abbrs
	function eq(x,y){return this.equals(x,y);}
	function neq(x,y){return this.notEquals(x,y);}
	function lt(x,y){return this.lessThan(x,y);}
	function lte(x,y){return this.lessThanOrEqual(x,y);}
	function gt(x,y){return this.greaterThan(x,y);}
	function gte(x,y){return this.greaterThanOrEquals(x,y);}
	function nin(x,y){return this.notIn(x,y);}
	function ex(x){return this.exists(x);}
	function nex(x){return this.notExists(x);}
	
	function nl(x){return this.isNull(x);}
	function nnl(x){return this.isNotNull(x);}
	function lk(x){return this.like(x);}
	function nlk(x){return this.notLike(x);}
	
	orX(expression){
		return this.andOrX("or", expression);
	}

	andX(expression){
		return this.andOrX("and", expression);
	}
	_andOrX(condition, expression){
		let expStr = "";
		if(expression instanceof "slashrDatabaseQueryExpression"){
			expStr = expression.toString();
			if(expression.getExpressionCount() > 1) expStr = "("+expStr+")";
		}
		else if(expression instanceof 'string'){
			expStr = expression;
		}
		else throw("Query Expression '{condition}' error: Must be expression or string");
		this.addPart(expStr, condition);
		return this;
	}

	equals(x,y){
		this.addPart(x+" = "+y);
		return this;
	}

	notEquals(x,y){
		this.addPart(x+" != "+y);
		return this;
	}

	lessThan(x, y){
		this.addPart(x+" < "+y);
		return this;
	}

	lessThanOrEquals(x, y){
		this.addPart(x+" <= "+y);
		return this;
	}

	greaterThan(x, y){
		this.addPart(x+" > "+y);
		return this;
	}

	greaterThanOrEquals(x, y){
		this.addPart(x+" >= "+y);
		return this;
	}
	in(x, y){
		return this.inNotIn("IN", x, y);
	}
	notIn(x, y){
		return this.inNotIn("NOT IN", x, y);
	}
	_inNotIn(condition, x, y){
		let expStr = y;
		if(y instanceof "slashrDatabaseQuery") expStr = y.toString();
		else if(y instanceof 'array'){
			for(let i in y){
				if(! is_numeric(y[i])) y[i] = "'"+val+"'";
			}
			expStr = implode(",",y);
		}
		if(! expstr instanceof 'string') throw new frak("value for {condition} must be either string / array / or expression.");
		this.addPart(x+" "+condition+" ("+expStr+")");
		return this;
	}
	exists(x){
		return this.existsNotExists("EXISTS", x);
	}
	notExists(x){
		return this.existsNotExists("NOT EXISTS", x);
	}
	_existsNotExists(condition, x){
		let expStr = x;
		if(x instanceof "blrDatabaseQuery") expStr = x.toString();
		else if(x instanceof 'array') die("not implemented");
		if(expStr instanceof 'string') throw ("value for "+condition+" must be either string / array / or expression.");
		this.addPart(condition+" ("+expStr+")");
		return this;
	}
	isNull(x){
		this.addPart(x+" IS NULL");
		return this;
	}
	isNotNull(x){
		this.addPart(x+" IS NOT NULL");
		return this;
	}

	like(x, y){
		this.addPart(x+" LIKE "+y);
		return this;
	}

	notLike(x, y){
		this.addPart(x+" NOT LIKE "+y);
		return this;
	}

	ifX(x, y, z){
		if(x instanceof "blrDatabaseQueryExpression"){
			x = x.toString();
		}
		else if(x instanceof 'string'){
			x = x;
		}
		if(! is_string(x)) throw new frak("contition value for mySql IF() must be either string or expression.");

		return "IF("+x+","+y+","+z+")";
	}

	min(x){throw("not implemented");}
	max(x){throw("not implemented");}
	count(x){throw("not implemented");}
	countDistinct(x){throw("not implemented");}

	toString(options = array()){
		let retStr = "";
		let i = 1;
		for(let p in this.parts){
			let part = parts[i];
			if(i > 1) retStr += (part.type == "or") ? " OR " : " AND ";
			retStr += part.expression;
			i++;
		}
		return retStr;
	}
	
}