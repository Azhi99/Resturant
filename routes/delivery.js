const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config.js");
const { createValidation, deleteValidation, updateValidation } = require("../validators/delivery.js");



router.post("/addDelivery", createValidation, (req,res) => {
    db("tbl_delivery").insert({
        invoice_id: req.body.invoice_id,
        address: req.body.address,
        phone: req.body.phone,
        delivery_price: req.body.delivery_price
    }).then((data) => {
        return res.json({
            message: "1 Delivery Added",
            data
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

router.delete("/deleteDelivery/:id", deleteValidation, (req,res) => {
    db("tbl_delivery").where("delivery_id", req.params.id).del().then((data) => {
        return res.json({
            message: data + " Delivery deleted"
        });
    });
});

router.patch("/updateDelivery/:id", updateValidation, createValidation, (req,res) => {
    db("tbl_delivery").where("delivery_id", req.params.id).update({
        invoice_id: req.body.invoice_id,
        address: req.body.address,
        phone: req.body.phone,
        delivery_price: req.body.delivery_price
    }).then((data) => {
        return res.json({
            message: data + " Delivery updated"
        });
    });
});

module.exports = router;