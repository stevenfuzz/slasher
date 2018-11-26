global._slashrAppInstace = null;
const slashr = class slashr{
	constructor(config){
		this._metadata = {
			listener: null,
			onExitCallbacks: [],
			config: config
		};
		if(! config) throw("Unable to instantiate slarshr. No config found.");
		let slashrUtilities = require("./slashrUtilities");
//		let slashrConfig = require("./slashrConfig");
		let slashrController = require("./controller/slashrController");
		let slashrModel = require("./model/slashrModel");
		this.utilities = this.utils = new slashrUtilities();
		this.controller = new slashrController(this);
		this.model = this.mdl = new slashrModel();

		global._slashrAppInstance = this;
	}
	async run(){
		const express = require('express');
		const bodyParser = require('body-parser');
		const path = require('path');
		const formidable = require('formidable');
		
		console.log("MOVE ALL OF THIS TO CONTROLLER");

		
		let controllerRequest = async (route, req, res) => {
			return await this.controller.run(route, req, res);
		};

		this._metadata.listener = express();
		// this._metadata.listener.use(express.static(path.join(__dirname, 'build')));
		
		// Set up static file server
		// console.log(this.config.storage);
		console.log("TODO: Get storage path from config.");
		this._metadata.listener.use("/files",express.static(global.slashr.config().storage.path,{fallthrough:false}));


		this._metadata.listener.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
			if (req.method === 'OPTIONS') res.sendStatus(200);
			else next();
		});
		

		this._metadata.listener.use(bodyParser.json());
		this._metadata.listener.use(bodyParser.urlencoded({ extended: true }));
		console.log("TODO: Set tmp to config tmp");
		this._metadata.listener.use(function(req, res, next) {
			var type = req.headers['content-type'];
			if(type && type.startsWith("multipart/form-data")){
				let form = new formidable.IncomingForm({
					uploadDir: '/tmp',
					multiples: true, // req.files to be arrays of files
				});
				form.once('error', console.log);
				form.parse(req, function (err, fields, files) {
					if(err) throw(err);
					req.fields = fields;
					req.files = files;
					next();
				});
			}
			else next();
		});
		// this._metadata.listener.use(formidable({
		// 	uploadDir: '/tmp',
  		// 	multiples: true, // req.files to be arrays of files
		// }));
		// const routes = {
		// 	feed : {
		// 		default : {
		// 			route : "/feed/:type"
		// 		}
		// 	},
		// 	profile : {
		// 		default : {
		// 			route : "/profile/:profileId"
		// 		}
		// 	}
		// }
		let routes = {}
		
		let routeFn = async (req, res, route) => {
			if(! route){
				route = {
					'controller' : (req.params.controller || "default"),
					'action' : (req.params.action || "default"),
					'key' : "default"
				};
			}
			await controllerRequest(route, req, res).then(
				(controllerResponse) => {
					controllerResponse.send();
				},
				(err) => {
					console.log(err);
					throw("An error has occured");
				}
			);
		};
		
		// Custom Routes
		for(let controller in routes){
			for(let action in routes[controller]){
				let actionRoutes = routes[controller][action].routes || {default:routes[controller][action].route};
				for(let routeKey in actionRoutes){
					this._metadata.listener.all(actionRoutes[routeKey], (req, res) => {
						routeFn(req, res, {
							controller: controller,
							action : action,
							key : routeKey
						});
					});
				}
			}
		}
		// Default Routes
		this._metadata.listener.all('/:controller/:action', (req, res) => {
			routeFn(req, res);
		});
		this._metadata.listener.all('/:controller', (req, res) => {
			routeFn(req, res);
		});
		
		// this._metadata.listener.use(function(req, res) {
		// 	res.sendStatus(404);
		// });

		this.listen();
	}
	onExit(callback){
		this._metadata.onExitCallbacks.push(callback);
	}
	listen(){
		this._metadata.listener.listen(process.env.PORT || 3001);

		let callback = false;
		callback = callback || (() =>{});
		
		callback = () => {
			if(! this._metadata.onExitCallbacks.length) return;
			console.log("slashr: App Exit... Running OnExit Callbacks.");
			let callbacks = this._metadata.onExitCallbacks;
			this._metadata.onExitCallbacks = [];
			for(let i in callbacks){
				callbacks[i]();
			}
		}
		
		process.on('mblcDisconnect',callback);

		// disconnect on exit
		process.on('beforeExit', function () {
			process.emit('mblcDisconnect');
		});
		
		process.on('exit', function () {
			process.emit('mblcDisconnect');
		});

		// catch ctrl+c event and exit normally
		process.on('SIGINT', function () {
			process.emit('mblcDisconnect');
			console.log('slashr: SIGINT exit...');
			process.exit(2);
		});

		//catch uncaught exceptions, trace, then exit normally
		process.on('uncaughtException', function(e) {
			process.emit('mblcDisconnect');
			console.log('slashr: Uncaught Exception...');
			console.log(e.stack);
			process.exit(99);
		});
	}
}
let slashrControllerAction = require("./controller/slashrControllerAction");
global.slashr = {
	getInstance : () => global._slashrAppInstance,
	model : () => {
		return global._slashrAppInstance.model;
	},
	utils : () => {
		return global._slashrAppInstance.utils;
	},
	utilities : () => {
		return global._slashrAppInstance.utils;
	},
	config : () => {
		return global._slashrAppInstance._metadata.config;
	}
};
module.exports = slashr;






//class blrEntityFactory extends blrComponentFactory{
//	private $name;
//	public function __construct($name, $options = array()) {
//		$this->name = $name;
//	}
//	protected function getObject($key = null, $options = array()){
//		$config = blr::config();
//		
//		$class = $this->name."Entity";
//		$path =  "{$config->get(blr::APPLICATION_PATH)}app/models/entities/{$class}.php";
//		
//		// If the entity does not exist, return base class and create a default entity
//		if(! file_exists($path)) $ent = new blrEntity($this->name, $options);
//		else{
//			// Include the entity
//			require_once($path);
//			$ent = new $class($this->name, $options);
//		}
//
//		// Check for key and init
//		if(! empty($key)){
//			$ent->init($key);
//		}
//		
//		return $ent;
//	}
//}
//<?php
//class blrEntityAbstractFactory extends blrComponentAbstractFactory{//
////	public function getFactory($name, $options = array()){
////		return new blrEntityFactory($name);
////	}
//}

//class slashrEntityAbstractFactory{
//	constructor(){
//		return new Proxy(function(){}, {
//			apply: function(obj, context, args){	
//				return null;
//			},
//			get : function(obj, prop){
//				return new slashrEntityFactory(prop);
//			}
//	});
//	}
//}

//class slashrEntityFactory{
//	constructor(name){
//		return new Proxy(function(){}, {
//			apply: function(obj, context, args){
//				let key = (args && args[0]) ? args[0] : null;
//				let ent = new slashrEntity(name);
//				if(key) ent.init(key);
//				return ent;
//			},
//			get : function(obj, prop){
//				return null;
//			}
//		});
//	}
//}
//
//class slashrEntity{
//	constructor(name){
//		this._metadata = {
//			name : name
//		};
//	}
//	_load(){
//		
//	}
//	init(key){
//		console.log(key);
//		console.log("INIT WITH KEY");
//	}
//	
//}

//class slashrDatabase{
//	constructor(){
//		this.query = this.qry = () => new slashrDatabaseQueryBuilder(this);
//	}
//}
//
//class slashrDatabaseMySqlAdapter{
////		abstract  function getConnectionDNS(values);
////		abstract  function getSchema(options);
////		abstract  function formatColumnSelectValue(value, columnMetadata);
////		abstract  function formatColumnInsertValue(value, columnMetadata);
//		
//		_createMember(name) {
//			switch(name){
//			case "table":
//			case "tbl":
//				throw("NO");
//				//return new blrDatabaseTableInstanceFactory(this);
//				break;
//			}
//		}
//		
//		_setup(options = array()){
//			this._initSchema(options);
//		}
//		__initSchema(options = array()){
//			this._metadata.schema = this.getSchema(options);
//		}
//		connect(options){
//			this._validateConnectionValues(options);
//			let connectionStr = this.getConnectionDNS(options);
//
//			// Add more databases and adapters
//			let mysql = require('mysql');
//			let con = mysql.createConnection({
//				host: "localhost",
//				user: "yourusername",
//				password: "yourpassword"
//			});
//			
//			con.connect(function(err) {
//			if (err) throw err;
//				console.log("Connected!");
//			});
//			
//			return con;
//		}
//	
//		 disconnect(){
//			this.connector = null;
//		}
//		 isConnected(){
//			return (! empty(this.connector));
//		}
//		 getConnection(){
//			return this.connector;
//		}
//		__validateConnectionValues(values){
//			if(empty(values[slashr.USERNAME])) throw new frak("Unable to connect to database, no username found.");
//			if(empty(values[slashr.PASSWORD])) throw new frak("Unable to connect to database, no username found.");
//			if(empty(values[slashr.HOST])) throw new frak("Unable to connect to database, no host found.");
//			if(empty(values[slashr.NAME])) throw new frak("Unable to connect to database, no database name found.");
//		}
//		executeQuery(query, options = array()){
////			try{
//				// Get the query type
//				queryType = this.getQueryType(query);
//				if(empty(queryType)) throw new frak("Could not find query type of query");
//				
//				
//				bindings = array();
//				// Format the bind values and query
//				if(! empty(options[slashr.BINDINGS])){
//					for(let key in options[slashr.BINDINGS]){
//						bindings[key] = this.formatBindValue(query, i, options[slashr.BINDINGS][key]);
//					}
//				}
//				sth = this.connector.prepare(query);
//				if(! empty(bindings)){
//					for(let key in bindings){
//						// Make sure that key exits
//						// Check for like
//						sth.bindValue(':'.key, bindings[key]);
//					}
//				}
//				
//				// Execute the query
//				sth.execute();
//				result = array();
//				insertId = null;
//				affectedRowCount = null;
//				switch(queryType){
//					case slashr.SELECT:
//					case slashr.SHOW:
//					case slashr.EXPLAIN:
//						// Get the results
//						result = sth.fetchAll(PDO.FETCH_CLASS);
//						break;
//					case slashr.INSERT:
//						insertId = this.connector.lastInsertId();
//						affectedRowCount = sth.rowCount();
//						break;
//					case slashr.UPDATE:
//					case slashr.DELETE:
//						affectedRowCount = sth.rowCount();
//						break;
//				}
//				
//				resultSetOptions = {
//					type: queryType,
//					rows: result,
//					affectedRowCount: affectedRowCount,
//					insertId: insertId
//				};
//				
//				resultSet = new blrDatabaseQueryResult(resultSetOptions);
//				
//				return resultSet;
//				
////			}
////			catch(PDOException ex){
////				throw new frak(ex.getMessage());
////			}
////			catch(frak ex){
////				throw new frak(ex.getMessage());
////			}
//		}
//		 tableExists(tableName){
//			return (! empty(this._metadata.scheme.tables[tableName]));
//		}
//		__formatBindValue(query, key, value){
//			// Format Like
//			if(strpos(query, "%:{key}") !== false){
//				value = '%'+value;
//				query = str_replace("%:{key}", ":{key}", query);
//			}
//			if(strpos(query, ":{key}%") !== false){
//				value = value+'%';
//				query = str_replace(":{key}%", ":{key}", query);
//			}
//			return value;
//		}
//		__getQueryType(query){
//			query = strtolower(trim(query));
//			value = substr(query, 0, strpos(query, ' '));
//			type = null;
//			switch(value){
//				case "select":
//					type = slashr.SELECT;
//					break;
//				case "insert":
//					type = slashr.INSERT;
//					break;
//				case "update":
//					type = slashr.UPDATE;
//					break;
//				case "delete":
//					type = slashr.DELETE;
//					break;
//				case "show":
//					type = slashr.SHOW;
//					break;
//				case "explain":
//					type = slashr.EXPLAIN;
//					break;
//			}
//			return type;
//		}
//	}
//
//class slashrDatabaseQueryBuilder{
////		
////		final public function __call($name, $arguments){
////			$utils = blr::utils();
////			$name = strtolower(trim($name));
////			if ($name == 'or' || $name == 'and' || $name == 'if'){
////				$fn = "{$name}X";
////				return call_user_func_array([$this,$fn], $arguments);
////			}
////			else if($utils->string->startsWith($name,"or")){
////				$fn = $utils->string->toCamelCase(substr($name, 2));
////				return $this->or(call_user_func_array([$this->db->qry->exp,$fn], $arguments));
////			}
////			else if($utils->string->startsWith($name,"and")){
////				$fn = $utils->string->toCamelCase(substr($name, 3));
////				return call_user_func_array([$this,$fn], $arguments);
////			}
////			else{
////				throw new frak("blrDatabaseQueryExpressionSqlAdapter method '{$name}' not found.");
////			}
////		}
//		
//		
//		
////		protected function getObject($key = null, $options = array()){
////			$config = blr::config();
////
////			$class = $this->name."Entity";
////			$path =  "{$config->get(blr::APPLICATION_PATH)}app/models/entities/{$class}.php";
////
////			// If the entity does not exist, return base class and create a default entity
////			if(! file_exists($path)) $ent = new blrEntity($this->name, $options);
////			else{
////				// Include the entity
////				require_once($path);
////				$ent = new $class($this->name, $options);
////			}
////
////			// Check for key and init
////			if(! empty($key)){
////				$ent->init($key);
////			}
////
////			return $ent;
////		}
//		
//		orX(expression){
//			return this.andOrX("or", expression);
//		}
//		
//		andX(expression){
//			return this.andOrX("and", expression);
//		}
//		_andOrX(condition, expression){
//			let expStr = "";
//			if(is_a(expression, "blrDatabaseQueryExpression")){
//				expStr = "{expression.toString()}";
//				if(expression.getExpressionCount() > 1) expStr = "({expStr})";
//			}
//			else if(is_string(expression)){
//				expStr = "{expression}";
//			}
//			else throw new frak("Query Expression '{condition}' error: Must be expression or string");
//			this.addPart(expStr, condition);
//			return this;
//		}
//		
//		equals(x,y){
//			this.addPart("{x} = {y}");
//			return this;
//		}
//		
//		notEquals(x,y){
//			this.addPart("{x} != {y}");
//			return this;
//		}
//		
//		lessThan(x, y){
//			this.addPart("{x} < {y}");
//			return this;
//		}
//		
//		lessThanOrEquals(x, y){
//			this.addPart("{x} <= {y}");
//			return this;
//		}
//		
//		greaterThan(x, y){
//			this.addPart("{x} >= {y}");
//			return this;
//		}
//		
//		greaterThanOrEquals(x, y){
//			this.addPart("{x} >= {y}");
//			return this;
//		}
//		
//		in(x, y){
//			return this.inNotIn("IN", x, y);
//		}
//		notIn(x, y){
//			return this.inNotIn("NOT IN", x, y);
//		}
//		_inNotIn(condition, x, y){
//			let expStr = y;
//			if(is_a(y, "blrDatabaseQuery")) expStr = y.toString();
//			else if(is_array(y)){
//				for(let i in y){
//					if(! is_numeric(y[i])) y[i] = "'{val}'";
//				}
//				expStr = implode(",",y);
//			}
//			if(! is_string(expStr)) throw new frak("value for {condition} must be either string / array / or expression.");
//			this.addPart("{x} {condition} ({expStr})");
//			return this;
//		}
//		exists(x){
//			return this.existsNotExists("EXISTS", x);
//		}
//		notExists(x){
//			return this.existsNotExists("NOT EXISTS", x);
//		}
//		_existsNotExists(condition, x){
//			let expStr = x;
//			if(is_a(x, "blrDatabaseQuery")) expStr = x.toString();
//			else if(is_array(x)) die("not implemented");
//			if(! is_string(expStr)) throw new frak("value for {condition} must be either string / array / or expression.");
//			this.addPart("{condition} ({expStr})");
//			return this;
//		}
//		isNull(x){
//			this.addPart("{x} IS NULL");
//			return this;
//		}
//		isNotNull(x){
//			this.addPart("{x} IS NOT NULL");
//			return this;
//		}
//		
//		like(x, y){
//			this.addPart("{x} LIKE {y}");
//			return this;
//		}
//		
//		notLike(x, y){
//			this.addPart("{x} NOT LIKE {y}");
//			return this;
//		}
//		
//		ifX(x, y, z){
//			if(is_a(x, "blrDatabaseQueryExpression")){
//				x = "{x.toString()}";
//			}
//			else if(is_string(x)){
//				x = "{x}";
//			}
//			if(! is_string(x)) throw new frak("contition value for mySql IF() must be either string or expression.");
//
//			return "IF({x},{y},{z})";
//		}
//
//		min(x){throw("not implemented");}
//		max(x){throw("not implemented");}
//		count(x){throw("not implemented");}
//		countDistinct(x){throw("not implemented");}
//		
//		toString(options = array()){
//			let retStr = "";
//			let i = 1;
//			for(let p in this.parts){
//				let part = parts[i];
//				if(i > 1) retStr += (part.type == "or") ? " OR " : " AND ";
//				retStr += part.expression;
//				i++;
//			}
//			return retStr;
//		}
//}


//class slashrQueryFactory{
//	constructory
//}

