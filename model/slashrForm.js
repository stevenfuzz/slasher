module.exports = class slashrForm{
	constructor(config){
		this._metadata = {
			elmts: {}
		};
	}
	addElement(name, options = {}){
		elmts[name] = new slashrFormElement(this, name, options);
	}
	
}

module.exports = class slashrFormElements{
	constructor(form, name, options={}){
		this._metadata = {
			elmts: {}
		};
		this.element = this.elmt = this.elements = this.elmts = this.getElement;
	}
	addElement(name, options = {}){

	}
	getElements(){
		return this._metadata.elmts;
	}
	
}