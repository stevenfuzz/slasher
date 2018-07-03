module.exports = class slashrComponentModel{
	constructor(){
		let model = global.slashr.model();
		this.domain = this.dm = model.domain;
		this.database = this.db = model.database;
		this.entity = this.ent = model.entity;
		this.storage = this.stor = model.storage;
	}
}