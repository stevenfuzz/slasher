module.exports = class slashrControllerResponse{
	constructor(response, result){
		this._metadata = {
			response: response,
			result : result
		};
	}
	async send(){
		if(this._metadata.result.handleResponse) this._metadata.result.handleResponse(this._metadata.response);
		else this._metadata.response.send(this._metadata.result.getResponseData());
	}
}