const express = require("express");
const moment = require("moment");
const router = express.Router();
const { db } = require("../DB/db_config.js");
const { body } = require("express-validator");
const validate = require("../validators/validate.js");

router.patch("/updateDollar",[
    body("dollar")
        .isNumeric({ gt: -1 }).withMessage("Dollar must be number"),
    body("last_update")
        .custom((value) => {
            var date = moment(value);
            if(date.isValid()){
                return Promise.resolve(true);
            }
            return Promise.reject(new Error("Enter correct date"));
        }),
    validate
], (req, res) => {
    db("tbl_dollar").where("dollar_id", 1).update({
        dollar: req.body.dollar,
        last_update: req.body.last_update
    }).then(() => {
        return res.json({
            message: "Dollar value successfully updated"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

module.exports = router;