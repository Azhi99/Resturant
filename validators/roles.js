const { body, param } = require("express-validator");
const { db } = require("../DB/db_config.js");
const validate = require("./validate.js");

module.exports = {
    createValidation:[
        body("user_id")
            .isInt({gt: 0}).withMessage("User Id must be number and grater than 0")
            .custom( async (value) => {
                const [data] = await db("tbl_users").where("user_id",value).select(["user_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This user does not exist"));
            }),
        body("roles")
            .isString().withMessage("Enter text")
            .isLength({min: 0}).withMessage("Invalid Length"),
        validate
    ],
    updateValidation:[
        param("id")
            .isInt({gt: 0}).withMessage("ID must be number and greater than 0"),
        body("user_id")
            .isInt({gt: 0}).withMessage("User Id must be number and grater than 0")
            .custom( async (value) => {
                const [data] = await db("tbl_users").where("user_id",value).select(["user_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This user does not exist"));
            }),
        body("roles")
            .isString().withMessage("Enter text")
            .isLength({min: 0}).withMessage("Invalid Length"),
        validate
    ],
    deleteValidation:[
        param("id")
            .isInt({gt: 0}).withMessage("ID must be number and greater than 0"),
        validate
    ]
};