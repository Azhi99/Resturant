const { body, param } = require("express-validator");
const moment = require("moment");
const validate = require("./validate.js");
const { db } = require("../DB/db_config.js");

module.exports = {
    createValidation: [
        body("expense_type")
            .isString().withMessage("Enter a text")
            .isLength({ min: 0 }).withMessage("Invalid length"),
        body("expense_date")
            .custom((value) => {
                var date = moment(value);
                if(date.isValid()){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("Enter a correct date"));
            }),
        body("price")
            .isNumeric({ gt: -1 }).withMessage("Price must be number"),
        body("user_id")
            .isNumeric({ gt: 0 }).withMessage("User ID must be number and greater than 0")
            .custom(async (value) => {
                const [data] = await db("tbl_users").where("user_id", value).select(["user_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This user does not exist"));
            }),
        validate
    ],
    deleteValidation: [
        param("id")
            .isInt({ gt: 0 }).withMessage("Expense ID must be number and greater than 0"),
        validate
    ],
    updateValidation: [
        param("id")
            .isInt({ gt: 0 }).withMessage("Expense ID must be number and greater than 0"),
        body("expense_type")
            .isString().withMessage("Enter a text")
            .isLength({ min: 1 }).withMessage("Invalid length"),
        body("expense_date")
            .custom((value) => {
                var date = moment(value);
                if(date.isValid()){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("Enter a correct date"));
            }),
        body("price")
            .isNumeric({ gt: -1 }).withMessage("Price must be number"),
        validate
    ]
}