const slashrStorageDisk = require("./slashrStorageDisk");
module.exports = class slashrStorageDisk{
	constructor(storage, options = {}) {
		this._metadata = {};
		this.setup(options);
	}
	setup() { /* Overload */ }
	save(file, options = {}){ throw("Save must be extended"); };
	delete(file, options = {}){ throw("Delete must be extended"); }
	copy(file, options = {}){ throw("Copy must be extended"); }
	write(contents, path, options = {}){ throw("Write must be extended"); }
	writeStream(stream, path, options = {}){ throw("WriteStream must be extended"); }
}