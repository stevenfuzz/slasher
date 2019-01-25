const slashrControllerActionResultModel = require("./slashrControllerActionResultModel");
module.exports = class slashrRedirectResultModel extends slashrControllerActionResultModel{
	constructor(controllerAction){
		super(controllerAction);
		this._metadata = {
			path: null,
			status: "200"
		}
	}
	set path(path){
		this._metadata.path = path;
	}
	set status(status){
		this._metadata.status = status;
	}
	handleResponse(res){
		if(this._metadata.path){
			res.redirect(this._metadata.path,this._metadata.status);
		}
		else res.status(this._metadata.status).end();
	}
}