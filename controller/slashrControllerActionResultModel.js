module.exports = class slashrControllerActionResultModel{
	constructor(controllerAction){
		this._metadata = {
			action: controllerAction
		};
		this.data = {};
	}
	getResponseData(){
		return this.data;
	}
}