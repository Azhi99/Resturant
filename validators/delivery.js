const { body, param } = require("express-validator");
const validate = require("./validate.js");
const { db } = require("../DB/db_config.js");

module.exports = {
    createValidation: [
        body("invoice_id")
            .isInt({ gt: 0 }).withMessage("Invoice ID must be number and greater than 0")
            .custom( async (value) => {
                const [data] = await db("tbl_invoice").where("invoice_id", value).select(["invoice_id"]).limit(1);
                if(data){
                    return Promise.resolve(true);
                }
                return Promise.reject(new Error("This Invoice ID does not exist"));
            }),
        body("address")
            .isString().withMessage("Enter a text")
            .isLength({ min: 0 }).withMessage("Invalid length"),
        body("phone")
            .isLength({ min: 11 }).withMessage("Invalid phone number"),
        body("delivery_price")
            .isInt({ gt: -1 }).withMessage("Price cannot be negative"),
        validate
    ],
    deleteValidation: [
        param("id")
            .isInt({ gt: 0 }).withMessage("Delivery ID must be number and greater than 0"),
        validate
    ],
    updateValidation: [
        param("id")
            .isInt({ gt: 0 }).withMessage("Delivery ID must be number and greater than 0"),
        validate
    ]
};
