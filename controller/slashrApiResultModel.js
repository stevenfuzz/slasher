const slashrControllerActionResultModel = require("./slashrControllerActionResultModel");
module.exports = class slashrApiResultModel extends slashrControllerActionResultModel{
	constructor(controllerAction){
		super(controllerAction);
		this._metadata.accessToken = null;
		console.log("TODO: Compare api id to request id, and always return request id");
	}
	get accessToken(){
		return this._metadata.accessToken;
	}
	set accessToken(accessToken){
		this._metadata.accessToken = accessToken;
		return this;
	}
	get error(){
		return this._metadata.error;
	}
	set error(error){
		this._metadata.error = error;
		return this;
	}
	getResponseData(){
		console.log(this);
		
		return {
			accessToken: this._metadata.accessToken,
			error: null,
			data: this.data,
			id: null
		};
	}
}