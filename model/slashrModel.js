module.exports = class slashrModel{
	constructor(){
		//console.log("TODO: Put this in a proxy so it load ala carte?");
		let slashrDomainInstanceFactory = require("./slashrDomainInstanceFactory");
		let slashrDatabaseInstanceFactory = require("./slashrDatabaseInstanceFactory");
		let slashrEntityAbstractFactory = require("./slashrEntityAbstractFactory");
		let slashrCacheInstanceFactory = require("./slashrCacheInstanceFactory");
		let slashrStorageInstanceFactory = require("./slashrStorageInstanceFactory");
		this.domain = this.dm = new slashrDomainInstanceFactory();
		this.entity = this.ent = new slashrEntityAbstractFactory();
		this.database = this.db = new slashrDatabaseInstanceFactory();
		this.cache = this.csh = new slashrCacheInstanceFactory();
		this.storage = this.stor = new slashrStorageInstanceFactory();
		
	}
}