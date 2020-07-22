const express = require("express");
const moment = require("moment");
const router = express.Router();
const { db } = require("../DB/db_config.js");
const { body } = require("express-validator");
const validate = require("../validators/validate.js");

router.patch("/updateDollar",[
    body("dollar")
        .isNumeric({ gt: -1 }).withMessage("Dollar must be number"),
    validate
], (req, res) => {
    db("tbl_dollar").where("dollar_id", 1).update({
        dinar: req.body.dollar,
        last_update: db.fn.now()
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