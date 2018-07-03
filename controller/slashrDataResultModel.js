const slashrControllerActionResultModel = require("./slashrControllerActionResultModel");
module.exports = class slashrDataResultModel extends slashrControllerActionResultModel{
	constructor(controllerAction){
		super(controllerAction);
	}
	getResponseData(){
		return this.data;
	}
}