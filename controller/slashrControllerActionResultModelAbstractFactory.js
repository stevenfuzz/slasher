module.exports = class slashrControllerActionResultModelAbstractFactory{
	constructor(controllerAction){
		this._metadata = {
			action: controllerAction
		};
		return new Proxy(this, {
			get : function(obj, prop){
				switch(prop){
					case "json":
					case "data":
					case "dt":
						// RETURN A PROXY AND USE APPLY TO GET THE ARGS
						//console.log("TODO: Why is this being done this way");
						let slashrDataResultModel = require("./slashrDataResultModel");
						return (data = {}) => {
							let rslt = new slashrDataResultModel(controllerAction);
							rslt.data = data;
							return rslt
						};
					case "api":
						let slashrApiResultModel = require("./slashrApiResultModel");
						return (data = {}) => {
							let rslt = new slashrApiResultModel(controllerAction);
							rslt.data = data;
							return rslt;
						};
						break;
					case "html":
						let slashrHtmlResultModel = require("./slashrHtmlResultModel");
						return (content = '') => {
							let rslt = new slashrHtmlResultModel(controllerAction);
							rslt.content = content;
							return rslt;
						};
						break;
					case "xml":
						let slashrXmlResultModel = require("./slashrXmlResultModel");
						return (content = '') => {
							let rslt = new slashrXmlResultModel(controllerAction);
							rslt.content = content;
							return rslt;
						};
						break;
//					case "redirect":
//					case "rdr":
//						throw("TODO blrControllerActionResultModelAbstractFactory fwd");
//						return new slashrRedirectResultModelFactory(obj._metadata.action);
//	//					return new blrRedirectResultModelFactory($this->action, blr::DEFAULT_VALUE, array(
//	//						blr::DEFAULT_VALUE => true
//	//					));
//						break;
//					case "forward":
//					case "fwd":
//						return function(container, controller, action, options){
//							return new blrForwardResultModelFactory(obj._metadata.action, container, controller, action, options);
//						};
//	//					return new blrForwardResultModelFactory($this->action, blr::DEFAULT_VALUE, array(
//	//						blr::DEFAULT_VALUE => true
//	//					));
//						break;
				}
			}
		});
	}
};