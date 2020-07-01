const { body, validationResult } = require("express-validator");
const validate = require("./validate.js");
module.exports = {
    createValidation:[
        body("username")
            .isString().withMessage("Enter a string")
            .isLength({ min:1, max: 50}).withMessage("Invalid length"),
        body("password")
            .isString().withMessage("Enter a string")
            .isLength({ min:6, max: 20}).withMessage("Invalid length"),
        body("role")
            .custom(function(value){
                if(value=="Admin" || value=="User"){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("Invalid User role"));
            }),
        body("status")
            .custom(function(value){
                if(value=="1" || value=="0"){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("Invalid User status"));
            }),
        body("phone").isLength({ min: 0, max: 15 }),
        validate
    ]
};
