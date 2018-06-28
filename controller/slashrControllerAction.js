module.exports = class slashrControllerAction{
	constructor(){
		let slashrComponentModel = require("../model/slashrComponentModel");
		let slashrControllerActionResultModelAbstractFactory = require("./slashrControllerActionResultModelAbstractFactory");
		this.mdl = this.model = new slashrComponentModel();
		this.result = this.rslt = new slashrControllerActionResultModelAbstractFactory(this);
		this.setup();
	}
	setup(){}
}