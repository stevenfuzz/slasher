const slashrControllerActionResultModel = require("./slashrControllerActionResultModel");
module.exports = class slashrXmlResultModel extends slashrControllerActionResultModel{
	constructor(controllerAction){
		super(controllerAction);
		this._metadata.content = "";
	}
	get error(){
		return this._metadata.error;
	}
	set error(error){
		this._metadata.error = error;
		return this;
	}
	set content(content){
		this._metadata.content = content;
	}
	get content(){
		return this._metadata.content;
	}
	getResponseData(){
		return this._metadata.content;
	}
}