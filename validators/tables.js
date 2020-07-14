const { body, param } = require("express-validator");
const { db } = require("../DB/db_config");
const validate = require("./validate");

module.exports = {
  createValidation: [
    body("table_num")
      .isInt({ gt: 0 })
      .withMessage("Table number must be number and greater than 0"),
    body("position")
      .isInt({ gt: 0 })
      .withMessage("Position must be number and greater than 0"),
      body("state")
      .isInt({ gt: 0 })
      .withMessage("state must be number and greater than 0"),
      body("type")
            .isString().withMessage("Enter a text")
  ],
  deleteValidation: [
    param("id")
      .isInt({ gt: 0 })
      .withMessage("Table ID must be number and greater than 0"),
    validate,
  ],
  updateValidation: [
    param("id")
      .isInt({ gt: 0 })
      .withMessage("Table ID must be number and greater than 0"),
    validate,
  ],
};
