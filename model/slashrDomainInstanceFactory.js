module.exports = class slashrDomainInstanceFactory{
	constructor(){
		this._metadata = {};
		this._metadata.instances = {};
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				
				if(self._metadata.instances[prop]){
					return self._metadata.instances[prop];
				}

				// Include the domain
				console.log("FIX APPPATCH AND REMOVE GLOBAL CALL");
				let appPath = "../../../";
				let util = require("util");
				
				let domainClass = require(appPath+"models/domains/"+prop+"Domain");

				const actionExtend = {
					model : global.slashr.model(),
					mdl : global.slashr.model()
				};
		
				// Add context to the controller class
				Object.setPrototypeOf(domainClass.prototype, actionExtend);

				// Instaniate the controller
				let domain = new domainClass();
				// Add to instances
				self._metadata.instances[prop] = domain;
				return domain;
			}
		});
	}
}