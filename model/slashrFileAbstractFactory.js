module.exports = class slashrFileAbstractFactory{
	constructor(){
		let self = this;
		console.log("RETURNING PROXY");
		return new Proxy(function(){}, {
			get : function(obj, prop){
				console.log("GET FILE FAC ABS");
				console.log(prop);
				throw("SDFLKJSDLKFJLSKJDFH");
			},
			apply : function(obj, context, args){
				console.log("SALDKJFSDLJFLKSDJF APPLY!!!");
				console.log(args);
				throw("SDFLKJSDLKFJLKSDJFH");
			}
		});
	}
}