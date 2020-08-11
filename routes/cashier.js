const express = require("express");
const { db } = require("../DB/db_config");
const router = express.Router();

router.post("/getInvoiceByTable/:table_num", async (req, res) => {
    const [invoice] = await db("tbl_invoice")
                            .where("table_num", req.params.table_num)
                            .andWhere("status", "0")
                            .select([
                                "invoice_id",
                                "type",
                                "table_num",
                                "status",
                                "total_price",
                                "amount_paid",
                                "discount",
                                "service",
                            ])
                            .limit(1);
    var invoice_id = 0;
    if(typeof invoice != "undefined"){
        invoice_id = invoice.invoice_id;
    }
    var invoice_foods = await db.select(
        "tbl_invoice_detail.id_id as id",
        "tbl_foods.food_name as food_name",
        "tbl_invoice_detail.qty as qty",
        "tbl_foods.price as price",
        db.raw("(tbl_foods.price * tbl_invoice_detail.qty) as all_price")
    ).from("tbl_invoice_detail")
     .join("tbl_foods", "tbl_foods.food_id", "=", "tbl_invoice_detail.food_id")
     .where("tbl_invoice_detail.invoice_id", invoice_id);
    
    return res.status(200).json({
        invoice,
        invoice_foods
    });

});

module.exports = router;