module.exports = class slashrStorageDisk{
	_metadata = {};
	constructor(storage, options = {}) {
		this.setup(options);
	}
	setup() { /* Overload */ }
	save(file, options = {}){ throw("Save must be extended"); };
	delete(file, options = {}){ throw("Delete must be extended"); }
	copy(file, options = {}){ throw("Copy must be extended"); }
}