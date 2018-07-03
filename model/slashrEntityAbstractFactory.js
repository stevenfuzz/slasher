module.exports = class slashrEntityAbstractFactory{
	constructor(){
		let self = this;
		return new Proxy(function(){}, {
			get : function(obj, prop){
				// Include the domain
				// Instaniate the entity
				let slashrEntity = new require("./slashrEntity");
				return async (key, options) => {
					let entity = new slashrEntity(prop, options);
					await entity._load();
					if(key) await entity.init(key);
					return entity;
				};
			}
		});
	}
}