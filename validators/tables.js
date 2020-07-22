const { body, param } = require("express-validator");
const validate = require("./validate.js");

module.exports = {
  createValidation: [
    body("table_num")
      .isInt({ gt: 0 })
      .withMessage("Table number must be number and greater than 0"),
    body("position")
      .isIn(["Inside","Outside"])
      .withMessage("Position must be Inside or Outside"),
    body("state")
      .isInt({ gt: -1, lt: 3 })
      .withMessage("state must be number and greater than 0"),
    body("type")
      .isIn(["Normal","VIP"])
      .withMessage("Type must be normal or VIP"),
    validate
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
    body("table_num")
      .isInt({ gt: 0 })
      .withMessage("Table number must be number and greater than 0"),
    body("position")
      .isIn(["Inside","Outside"])
      .withMessage("Position must be Inside or Outside"),
    body("state")
      .isInt({ gt: -1, lt: 3 })
      .withMessage("state must be number and greater than 0"),
    body("type")
      .isIn(["Normal","VIP"])
      .withMessage("Type must be normal or VIP"),
    validate,
  ],
};
