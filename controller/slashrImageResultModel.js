const slashrControllerActionResultModel = require("./slashrControllerActionResultModel");
module.exports = class slashrImageResultModel extends slashrControllerActionResultModel{
	constructor(controllerAction){
		super(controllerAction);
		this._metadata.image = {content:""};
	}
	get image(){
		return this._metadata.image;
	}
	set image(image){
		this._metadata.image = image;
		return this;
	}
	// get content(){
	// 	return this._metadata.image.content;
	// }
	async handleResponse(res){
		res.writeHead(200,{'Content-type':this.image.mimeType});
		await this.image.pipe(res);
		this.image.clearTempFile();
	}
	// getResponseData(){
	// 	return null;
	// }
}