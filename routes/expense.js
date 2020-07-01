const express = require("express");
const { db } = require("../DB/db_config.js");
const { createValidation, deleteValidation, updateValidation } = require("../validators/expense.js");

const router = express.Router();

router.post("/addExpense", createValidation, (req,res) => {
    db("tbl_expense").insert({
        expense_type: req.body.expense_type,
        expense_date: req.body.expense_date,
        price: req.body.price,
        note: req.body.note,
        user_id: req.body.user_id
    }).then((data) => {
        return res.json({
            message: "1 Expense Added",
            data
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
        expense_date: req.body.expense_date,
        price: req.body.price,
        note: req.body.note
    }).then((data) => {
        return res.json({
            message: data + " Expense updated"
        });
    });
});

module.exports = router;