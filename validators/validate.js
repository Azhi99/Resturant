const { body, validationResult } = require("express-validator");

module.exports = function(req, res, next) {
    var errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({error: errors.array() });
    }
    next();
}