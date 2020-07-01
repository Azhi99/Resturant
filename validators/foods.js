const { body, param } = require("express-validator");
const validate = require("./validate.js");
const { db } = require("../DB/db_config.js");

module.exports = {
    createValidation: [
        body("food_name")
            .isString().withMessage("Enter a text")
            .isLength({ min: 1, max: 250 }).withMessage("Invalid length"),
        body("type_id")
            .isInt({ gt: 0 }).withMessage("Type ID must be a number and grater than 0")
            .custom(async (value) => {
                const [data] = await db("tbl_food_types").where("type_id", value).select(["type_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This type does not exist"));
            }),
        body("price")
            .isNumeric({ gt: 0 }).withMessage("Price must be number and greater than 0"),
        body("user_id")
            .isInt({ gt: 0 }).withMessage("User ID must be a number and grater than 0")
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
            .isInt({ gt: 0 }).withMessage("Food ID must be number and greater than 0"),
        validate
    ],
    updateValidation: [
        param("id")
            .isInt({ gt: 0 }).withMessage("Food ID must be number and greater than 0"),
        body("food_name")
            .isString().withMessage("Enter a text")
            .isLength({ min: 1, max: 250 }).withMessage("Invalid length"),
        body("type_id")
            .isInt({ gt: 0 }).withMessage("Type ID must be a number and grater than 0")
            .custom(async (value) => {
                const [data] = await db("tbl_food_types").where("type_id", value).select(["type_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This type does not exist"));
            }),
        body("price")
            .isNumeric({ gt: 0 }).withMessage("Price must be number and greater than 0"),
        validate
    ]
}