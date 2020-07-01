const { body, param } = require("express-validator");
const validate = require("./validate.js");

module.exports = {
    createValidation: [
        body("type_name")
            .isString().withMessage("Enter a text")
            .isLength({ min: 1, max: 200 }).withMessage("Invalid length"),
            validate       
    ],
    deleteValidation: [
        param("id").isInt().withMessage("ID must be a number"),
        validate
    ],
    updateValidation: [
        param("id").isInt().withMessage("ID must be a number"),
        validate
    ],
};