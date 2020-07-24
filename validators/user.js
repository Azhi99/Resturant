const { body, param } = require("express-validator");
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
            .isIn(["Admin","User"]).withMessage("Invalid User role"),
        body("phone")
            .isLength({ min: 0, max: 15 }),
        validate
    ],
    updateValidation:[

    ],
    checkID:[
        param("id")
            .isInt({gt: 0}).withMessage("ID must be number and grted than 0"),
        validate
    ]
};
