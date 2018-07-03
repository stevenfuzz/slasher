module.exports = class slashrControllerResponse{
	constructor(response, result){
		this._metadata = {
			response: response,
			result : result
		};
	}
	async send(){
		this._metadata.response.send(this._metadata.result.getResponseData());
	}
}