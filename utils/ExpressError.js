// // custom express error class
class ExpressError extends Error{
    constructor(message, statuscode){
        super();
        this.statusCode = statuscode;
        this.message=message;
    }
}
module.exports=ExpressError;