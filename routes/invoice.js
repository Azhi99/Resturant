const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config.js");

router.post("/addInvoice", (req, res) => {
  db("tbl_invoice")
    .insert({
      invoice_id: req.body.invoice_id,
      type: req.body.type,
      table_num: req.body.table_num,
      status: req.body.status,
      total_price: req.body.total_price,
      amount_paid: req.body.amount_paid,
      discount: req.body.discount,
      service: req.body.service,
      user_id: req.body.user_id,
      invoice_date: req.body.invoice_date,
    })
    .then((result) => {
      return res.status(200).json({
        message: result + " invoice created",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

router.patch("/updateInvoice/:id", (req, res) => {
  db("tbl_invoice")
    .where("invoice_id", req.params.id)
    .update({
      type: req.body.type,
      table_num: req.body.table_num,
      status: req.body.status,
      total_price: req.body.total_price,
      amount_paid: req.body.amount_paid,
      discount: req.body.discount,
      service: req.body.service,
      user_id: req.body.user_id,
      invoice_date: req.body.invoice_date,
    })
    .then((result) => {
      return res.status(200).json({
        message: result + " invoice updated",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

router.delete("/deleteInvoice/:id", (req, res) => {
  db("tbl_invoice")
    .where("invoice_id", req.params.id)
    .del()
    .then((result) => {
      return res.status(200).json({
        message: result + " invoice deleted",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

module.exports = router;
