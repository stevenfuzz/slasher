module.exports = class slashrControllerActionRequest{
	constructor(){
		this._metadata = {
			controller: "default",
			action: "default",
			method: null,
			url: null
		};
		this.data = this.dt = {
			route : {},
			query : {},
			post : {},
			cookies : {}
		};
	}
	init(route, req){
		this._metadata.method = req.req;
		this._metadata.url = req.url;
		this._metadata.controller = route.controller;
		this._metadata.action = route.action;
		this.data.route = req.params;
		this.data.query = req.query;
		if(req.body) this.data.post = req.body;
		
		console.log("TODO: Put cookie and post data in the result");

	}
	getRouteInfo(){
		return {
			controller: this._metadata.controller,
			action: this._metadata.action,
		};
	}
}