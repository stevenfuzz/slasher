module.exports = class slashrControllerActionRequest{
	constructor(){
		this._metadata = {
			controller: "default",
			action: "default",
			method: null,
			url: null
		};
		this.data = this.dt = {
			route: {},
			query: {},
			post: {},
			files: {},
			cookies: {}
		};
	}
	init(route, req){
		this._metadata.method = req.req;
		this._metadata.url = req.url;
		this._metadata.controller = route.controller;
		this._metadata.action = route.action;
		this.data.route = req.params;
		this.data.query = req.query;
		if(req.fields) this.data.post = req.fields;
		else if(req.body) this.data.post = req.body;
		if(req.files) this.data.files = req.files;

		console.log("init requrest");
		console.log(this.data);
	
		console.log("TODO: Put cookie and post data in the result");

	}
	getRouteInfo(){
		return {
			controller: this._metadata.controller,
			action: this._metadata.action,
		};
	}
}