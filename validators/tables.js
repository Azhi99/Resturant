const { body, param } = require("express-validator");
const { db } = require("../DB/db_config.js");
const validate = require("./validate.js");

module.exports = {
  createValidation: [
    body("table_num")
      .isInt({ gt: 0 })
      .withMessage("Table number must be number and greater than 0"),
    body("position")
      .isIn(["Inside","Outside"])
      .withMessage("Position must be Inside or Outside"),
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
  checkNum:[
    param("num")
      .isInt({ gt: 0 }).withMessage("Table number must be number and greater than 0")
      .custom( async (value) => {
        const [{table_num}] = await db("tbl_tables").where("table_num", value).select(["table_num"]).limit(1);
        if(table_num){
          return Promise.resolve(true);
        }
        return Promise.reject(new Error("This table does not exist"));
      }),
    validate
  ]
};
