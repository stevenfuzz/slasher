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
			cookies: {},
			headers: {
				authorization : {
					bearer : null
				}
			}
		};

	}
	init(route, req){
		this._metadata.method = req.req;
		this._metadata.url = req.url;
		this._metadata.controller = route.controller;
		this._metadata.action = route.action;
		this.data.route = req.params;
		this.data.query = req.query;

		console.log("TODO: Merge fields and files for forms in request");
		console.log("TODO: Make sure controllers and requests are per instance based.");

		if(req.fields){
			if(req.fields._slashrFormMetadata){
				req.fields._slashrFormMetadata = JSON.parse(req.fields._slashrFormMetadata);
				for(let name in req.fields){
					if(req.fields._slashrFormMetadata.elmts[name] && req.fields._slashrFormMetadata.elmts[name].dataType){
						switch(req.fields._slashrFormMetadata.elmts[name].dataType){
							case "json":
								this.data.post[name] = JSON.parse(req.fields[name]);
							break;
							case "date":
								if(req.fields[name] && req.fields[name] != ""){
									let d = new Date();
									d.setTime(req.fields[name]);
									this.data.post[name] = d;
								}
								else this.data.post[name] = null;
							break;
						}
					}
					else this.data.post[name] = req.fields[name];
				}
			}
			else this.data.post = req.fields;
		} 
		else if(req.body) this.data.post = req.body;
		if(req.files) this.data.files = req.files;

		if(req.headers){
			if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
				this.data.headers.authorization.bearer = req.headers.authorization.slice(7);
			}
		}
	
		console.log("TODO: Put cookie and post data in the result");

	}
	getRouteInfo(){
		return {
			controller: this._metadata.controller,
			action: this._metadata.action,
		};
	}
}