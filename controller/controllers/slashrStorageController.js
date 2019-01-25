module.exports = class slashrStorageController{
	constructor(){
		// Called for all actions
	}
	async imageAction(key,width=null,height=null, fit=null){
        let rslt = null;
        try{
            let image = key ? await this.mdl.stor.file.img(key) : false;
            if(! fit) fit = image.FIT_COVER;
            if(! image) throw("Image Error: No Image");

            if(width || height){
                image.scale(width, height, {
                    fit: fit
                });
            }
            rslt = this.rslt.image(image);
        }
        catch(err){
            console.log(err.Error || err);
            rslt = this.rslt.redirect(null,404);
        }
        return rslt;
	}
}