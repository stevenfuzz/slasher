module.exports = class slashrController{
	constructor(instance){
		let slashrControllerActionRequest = require("./slashrControllerActionRequest");
		this.request = new slashrControllerActionRequest();
		this.utils = instance.utils;
	}
	async run(route, request, response){
		let slashrControllerResponse = require("./slashrControllerResponse");
		this.request.init(route, request);
		let rslt = await this.getActionResult();		
		return new slashrControllerResponse(response, rslt);
	}
	async getActionResult(){
		let actionOptions = this.request.getRouteInfo();
		if(! actionOptions) throw("Unable to find controller options.");
		if(! actionOptions.controller) throw("Unable to find controller options. No controller found.");
		if(! actionOptions.action) throw("Unable to find controller options. No action found.");

		// Include the controller
		console.log("TODO: SETUP CONFIG FOR APPPATH!!!!!!!!!!!!!!!");
		let appPath = "../../../";
		let controllerClass = require(appPath+"controllers/"+actionOptions.controller+"Controller");

		// Add context to the controller class
		let slashrComponentModel = require("../model/slashrComponentModel");
		let slashrControllerActionResultModelAbstractFactory = require("./slashrControllerActionResultModelAbstractFactory");
		let actionMethod = actionOptions.action+"Action";
		let actionModel = new slashrComponentModel();
		let resultModel = new slashrControllerActionResultModelAbstractFactory();
		const actionExtend = {
			model : actionModel,
			mdl : actionModel,
			result : resultModel,
			rslt : resultModel,
			request : this.request,
			req : this.request
		};
			
		// Extend the action
		Object.setPrototypeOf(controllerClass.prototype, actionExtend);

		// Instaniate the controller
		let controller = new controllerClass();
		
		// Try to get the method args to send to action
		let methodArgs = this.utils.core.getMethodArgumentNames(controller, actionMethod);
		let actionArgs = [];

		for(let i in methodArgs){
			if(this.request.data.route[methodArgs[i]]) actionArgs.push(this.request.data.route[methodArgs[i]]);
			else if(this.request.data.query[methodArgs[i]]) actionArgs.push(this.request.data.query[methodArgs[i]]);
			else if(this.request.data.post[methodArgs[i]]) actionArgs.push(this.request.data.post[methodArgs[i]]);
			else actionArgs.push(null);
		}

		// now run the action
		let rslt = await controller[actionMethod](...actionArgs);

		return rslt;
	}
}