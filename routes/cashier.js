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
                                "status"
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
    
    var [[{total_price}]] = await db.raw("select sum(tbl_invoice_detail.qty * tbl_foods.price) as total_price from tbl_invoice_detail join tbl_foods on tbl_invoice_detail.food_id = tbl_foods.food_id where tbl_invoice_detail.invoice_id = ? limit 1", [invoice_id]);
    
    return res.status(200).json({
        invoice,
        invoice_foods,
        total_price
    });

});

router.post("/setFood", (req, res) => {
    if(req.body.invoice_id == null){
        db("tbl_invoice").insert({
            type: req.body.type,
            table_num: req.body.table_num,
            status: "0",
            total_price: 0,
            amount_paid: 0,
            discount: 0,
            service: 0 ,
            user_id: 16,
            invoice_date: db.fn.now()
        }).then(([data]) => {
            var invoice_id = data;
            db("tbl_invoice_detail").insert({
                invoice_id,
                food_id: req.body.food_id,
                qty: 1,
                note: null
            }).then(([data]) => {
                return res.status(200).json({
                    message: "Inserted",
                    invoice_id,
                    id: data
                });
            }).catch((err) => {
                return res.status(500).json({
                    message: err
                });
            });
        }).catch((err) => {
            return res.status(500).json({
                message: err
            });
        });
    } else {
        db("tbl_invoice").where("invoice_id", req.body.invoice_id).select(["status"]).then((data) => {
            console.log(data);
            if(data == 1){
                return res.status(500).json({
                    message: "ئەم وەصڵە فرۆشراوە"
                });
            } else {
                db("tbl_invoice_detail").where("food_id", req.body.food_id).select().then((data) => {
                    if(data){
                        db("tbl_invoice_detail").where("invoice_id", req.body.invoice_id).andWhere("food_id", req.body.food_id).update({
                            qty: db.raw(" qty + 1")
                        }).then(() => {
                            return res.status(200).json({
                                message: "Updated"
                            });
                        }).catch((err) => {
                            return res.status(500).json({
                                message: err
                            });
                        });
                    } else {
                        db("tbl_invoice_detail").insert({
                            invoice_id,
                            food_id: req.body.food_id,
                            qty: 1,
                            note: null
                        }).then(([data]) => {
                            return res.status(200).json({
                                message: "Inserted",
                                id: data
                            });
                        }).catch((err) => {
                            return res.status(500).json({
                                message: err
                            });
                        });
                    }
                });
            }
        }).catch((err) => {
            return res.status(500).json({
                message: err
            });
        });
    }
});

module.exports = router;