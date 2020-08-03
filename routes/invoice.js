const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config.js");

router.post("/getNoOfInvoices", async (req, res) => {
  var d_now = new Date().toISOString().split("T")[0];

  var d_week = new Date();
  d_week.setDate( d_week.getDate() - 8 );
  d_week = d_week.toISOString().split("T")[0];

  var d_month = new Date();
  d_month.setMonth( d_month.getMonth() - 1 );
  d_month = d_month.toISOString().split("T")[0];

  const [{all_invoice}] = await db("tbl_invoice").count("invoice_id as all_invoice");
  const [{daily_invoice}] = await db("tbl_invoice").where("invoice_date", d_now).count("invoice_id as daily_invoice");
  const [{weekly_invoice}] = await db("tbl_invoice").whereBetween("invoice_date", [d_week, d_now]).count("invoice_id as weekly_invoice");
  const [{monthly_invoice}] = await db("tbl_invoice").whereBetween("invoice_date", [d_month, d_now]).count("invoice_id as monthly_invoice");
  return res.status(200).json({
    all_invoice,
    daily_invoice,
    weekly_invoice,
    monthly_invoice
  });
});

router.post("/getDailyInvoice", async (req, res) => {
  var d_now = new Date().toISOString().split("T")[0];
  const invoices = await db.select(
      "tbl_invoice.invoice_id as invoice_id",
      "tbl_invoice.type as type",
      "tbl_invoice.status as status",
      "tbl_invoice.discount as discount",
      "tbl_invoice.service as service",
      "tbl_invoice.total_price as total_price",
      "tbl_users.full_name as username",
      "tbl_invoice.invoice_date as invoice_date"
    )
    .from("tbl_invoice")
    .join("tbl_users", "tbl_users.user_id", "=", "tbl_invoice.user_id")
    .where("tbl_invoice.invoice_date", d_now)
    .orderBy("tbl_invoice.invoice_id", "desc");

    const [{daily_sold}] = await db("tbl_invoice").where("invoice_date", d_now).sum("amount_paid as daily_sold");

    return res.status(200).json({
      invoices,
      daily_sold
    });
});

router.post("/getWeeklyInvoice", async (req, res) => {
  var d_now = new Date().toISOString().split("T")[0];

  var d_week = new Date();
  d_week.setDate( d_week.getDate() - 8 );
  d_week = d_week.toISOString().split("T")[0];

  const invoices = await db.select(
      "tbl_invoice.invoice_id as invoice_id",
      "tbl_invoice.type as type",
      "tbl_invoice.status as status",
      "tbl_invoice.discount as discount",
      "tbl_invoice.service as service",
      "tbl_invoice.total_price as total_price",
      "tbl_users.full_name as username",
      "tbl_invoice.invoice_date as invoice_date"
    )
    .from("tbl_invoice")
    .join("tbl_users", "tbl_users.user_id", "=", "tbl_invoice.user_id")
    .whereBetween("tbl_invoice.invoice_date", [d_week, d_now])
    .orderBy("tbl_invoice.invoice_id", "desc");

    const [{weekly_sold}] = await db("tbl_invoice").whereBetween("tbl_invoice.invoice_date", [d_week, d_now]).sum("amount_paid as weekly_sold");
    return res.status(200).json({
      invoices,
      weekly_sold
    });
});

router.post("/getMonthlyInvoice", async (req, res) => {
  var d_now = new Date().toISOString().split("T")[0];

  var d_month = new Date();
  d_month.setMonth( d_month.getMonth() - 1 );
  d_month = d_month.toISOString().split("T")[0];

  const invoices = await db.select(
      "tbl_invoice.invoice_id as invoice_id",
      "tbl_invoice.type as type",
      "tbl_invoice.status as status",
      "tbl_invoice.discount as discount",
      "tbl_invoice.service as service",
      "tbl_invoice.total_price as total_price",
      "tbl_users.full_name as username",
      "tbl_invoice.invoice_date as invoice_date"
    )
    .from("tbl_invoice")
    .join("tbl_users", "tbl_users.user_id", "=", "tbl_invoice.user_id")
    .whereBetween("tbl_invoice.invoice_date", [d_month, d_now])
    .orderBy("tbl_invoice.invoice_id", "desc");

    const [{monthly_sold}] = await db("tbl_invoice").whereBetween("tbl_invoice.invoice_date", [d_month, d_now]).sum("amount_paid as monthly_sold");
    return res.status(200).json({
      invoices,
      monthly_sold
    });
});

router.post("/addInvoice", (req, res) => {
  db("tbl_invoice").insert({
      type: req.body.type,
      table_num: req.body.table_num,
      status: req.body.status,
      total_price: req.body.total_price,
      amount_paid: req.body.amount_paid,
      discount: req.body.discount,
      service: req.body.service,
      user_id: req.body.user_id,
      invoice_date: db.fn.now()
    }).then((data) => {
      return res.status(200).json({
        message: data + " invoice created",
        invoice_id: data
      });
    }).catch((err) => {
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
