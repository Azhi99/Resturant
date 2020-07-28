const express = require("express");
const { db } = require("../DB/db_config.js");
const { createValidation, deleteValidation, updateValidation } = require("../validators/expense.js");

const router = express.Router();

router.post("/getData", (req, res) => {
    db.select(
      "tbl_expense.expense_id as expense_id",
      "tbl_expense.expense_type as expense_type",
      "tbl_expense.price as price",
      "tbl_expense.note as note",
      "tbl_expense.expense_date as expense_date",
      "tbl_users.full_name as username"
    )
      .from("tbl_expense")
      .join("tbl_users", "tbl_users.user_id", "=", "tbl_expense.user_id").then((data) => {
          return res.status(200).send(data);
      }).catch((err) => {
          return res.status(500).json({
              message: err
          });
      });
});

router.post("/addExpense", createValidation, (req,res) => {
    db("tbl_expense").insert({
        expense_type: req.body.expense_type,
        expense_date: db.fn.now(),
        price: req.body.price,
        note: req.body.note,
        user_id: req.body.user_id
    }).then(([data]) => {
        return res.json({
            message: "1 Expense Added",
            expense_id: data
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

// data is the number of deleted rows
router.delete("/deleteExpense/:id", deleteValidation, (req,res) => {
    db("tbl_expense").where("expense_id", req.params.id).del().then((data)=>{
        return res.json({
            message: data + " Expense deleted"
        });
    });
});

// data is the number of updated rows
router.patch("/updateExpense/:id", updateValidation, (req,res) => {
    db("tbl_expense").where("expense_id", req.params.id).update({
        expense_type: req.body.expense_type,
        price: req.body.price,
        note: req.body.note
    }).then((data) => {
        return res.json({
            message: data + " Expense updated"
        });
    });
});

module.exports = router;