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
        var table_num = req.body.table_num;
        
        db("tbl_tables").where("table_num", table_num).select().then(([data]) => {
            if(typeof data != "undefined" && data.state == 1){
                return res.status(500).json({
                    message: "ئەم مێزە حـجـز کراوە، سەرەتا بەتاڵی بکە"
                });
            } else {
                if(table_num == -1){
                    table_num = null;
                }
                if(table_num != null){
                    db("tbl_tables").where("table_num", table_num).update({
                        state: "2"
                    }).then(() => {
                        req.app.io.emit("taked", table_num);
                    });
                }
                db("tbl_invoice").insert({
                    type: req.body.type,
                    table_num,
                    status: "0",
                    total_price: 0,
                    amount_paid: 0,
                    discount: 0,
                    service: 0 ,
                    user_id: req.session.user_id,
                    invoice_date: new Date().toISOString().split("T")[0]
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
            }
        });
    } else {
        db("tbl_invoice").where("invoice_id", req.body.invoice_id).select(["status"]).then(( [{status}] ) => {
            if(status == 1){
                return res.status(500).json({
                    message: "ئەم وەصڵە فرۆشراوە"
                });
            } else {
                db("tbl_invoice_detail").where("invoice_id", req.body.invoice_id).andWhere("food_id", req.body.food_id).select().then((data) => {
                    if(data.length != 0){
                        db("tbl_invoice_detail").where("invoice_id", req.body.invoice_id).andWhere("food_id", req.body.food_id).update({
                            qty: db.raw("qty + 1")
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
                            invoice_id: req.body.invoice_id,
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

router.post("/sellInvoice", (req, res) => {
    db("tbl_invoice").where("invoice_id", req.body.invoice_id).select(["status"]).limit(1).then(([{status}]) => {
        if(status == 1){
            return res.status(500).json({
                message: "ئەم وەصڵە فرۆشراوە"
            });
        } else {
            db("tbl_invoice").where("invoice_id", req.body.invoice_id).update({
                status: "1",
                total_price: req.body.total_price,
                amount_paid: req.body.amount_paid,
                service: req.body.service,
                discount: req.body.discount
            }).then(() => {
                db("tbl_invoice").where("invoice_id", req.body.invoice_id).select(["type", "table_num"]).limit(1).then(([data]) => {
                    if(data.table_num){
                        db("tbl_tables").where("table_num", data.table_num).update({
                            state: "0"
                        }).then(() => {
                            req.app.io.emit("settedNull", data.table_num);
                        });
                    }
                    if(data.type == 2){
                        db("tbl_delivery").insert({
                            invoice_id: req.body.invoice_id,
                            address: req.body.address,
                            phone: req.body.phone,
                            delivery_price: req.body.delivery_price
                        }).then(() => {
                            return res.status(200).json({
                                message: "Invoice Sold"
                            });
                        });
                    } else {
                        return res.status(200).json({
                            message: "Invoice Sold"
                        });
                    }
                });
            });
        }
    });
});

router.delete("/deleteInvoiceFood/:invoice_detail_id/:invoice_id", (req, res) => {
    db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["status"]).then(([{status}]) => {
        if(status == 1){
            return res.status(500).json({
                message: "ئەم وەصڵە فرۆشراوە، ناتوانی خواردنەکانی بسڕیتەوە"
            });
        } else {
            db("tbl_invoice_detail").where("id_id", req.params.invoice_detail_id).delete().then(() => {
                db("tbl_invoice_detail").where("invoice_id", req.params.invoice_id).count("* as noOfInvoices").then(([{noOfInvoices}]) => {
                    if(noOfInvoices == 0){
                        db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["table_num"]).then(([data]) => {
                            if(data.table_num){
                                db("tbl_tables").where("table_num", data.table_num).update({
                                    state: "0"
                                }).then(() => req.app.io.emit("settedNull", data.table_num));
                            }
                            db("tbl_invoice").where("invoice_id", req.params.invoice_id).delete().then(() => {
                                return res.status(200).json({
                                    message: "Invoice Deleted"
                                });
                            });
                        });
                    } else {
                        return res.status(200).json({
                            message: "Food Deleted"
                        });
                    }
                });
            }).catch((err) => {
                return res.status(500).json({
                    message: err
                });
            });
        }
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

router.delete("/minusFood/:invoice_detail_id/:invoice_id", (req, res) => {
    db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["status"]).limit(1).then(([{status}]) => {
        if(status == 1){
            return res.status(500).json({
                message: "ئەم وەصڵە فرۆشراوە، ناتوانی هیچ خواردنێک کەم بکەیتەوە"
            });
        } else {
            db("tbl_invoice_detail").where("id_id", req.params.invoice_detail_id).select(["qty"]).limit(1).then(([{qty}]) => {
                if(qty == 1){
                    db("tbl_invoice_detail").where("id_id", req.params.invoice_detail_id).delete().then(() => {
                        db("tbl_invoice_detail").where("invoice_id", req.params.invoice_id).count("* as no_of_foods").then(([{no_of_foods}]) => {
                            if(no_of_foods >= 1){
                                return res.status(200).json({
                                    message: "Food Deleted"
                                });
                            } else {
                                db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["table_num"]).then(([{table_num}]) => {
                                    if(table_num != null){
                                        db("tbl_tables").where("table_num", table_num).update({
                                            state: "0"
                                        }).then(() => {
                                            req.app.io.emit("settedNull", table_num);
                                        });
                                    }
                                    db("tbl_invoice").where("invoice_id", req.params.invoice_id).delete().then(() => {
                                        return res.status(200).json({
                                            message: "Invoice Deleted"
                                        });
                                    });
                                });
                            }
                        });
                    });
                } else {
                    db("tbl_invoice_detail").where("id_id", req.params.invoice_detail_id).update({
                        qty: db.raw("qty - 1")
                    }).then(() => {
                        return res.status(200).json({
                            message: "Food Decreased"
                        });
                    });
                }
            });
        }
    });
});

router.patch("/plusFood/:invoice_detail_id/:invoice_id", (req, res) => {
    db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["status"]).then(([{status}]) => {
        if(status == 1){
            return res.status(500).json({
                message: "ئەم وەصڵە فرۆشراوە، ناتوانیت هیچ خواردنێک زیاد بکەیت"
            });
        } else {
            db("tbl_invoice_detail").where("id_id", req.params.invoice_detail_id).update({
                qty: db.raw("qty + 1")
            }).then(() => {
                return res.status(200).json({
                    message: "Food Increased"
                });
            });
        }
    });
})

router.patch("/changeTable/:invoice_id", (req, res) => {
    db("tbl_invoice").where("invoice_id", req.params.invoice_id).select(["type"]).then(([{type}]) => {
        if(type == 0){
            db("tbl_tables").where("table_num", req.body.new_table).select(["state"]).then(([{state}]) => {
                if(state == 1){
                    return res.status(500).json({
                        message: "ئەم مێزە حیجز کراوە"
                    });
                } else if(state == 2){
                    return res.status(500).json({
                        message: "ئەم مێزە گـیراوە"
                    });
                } else {
                    db("tbl_invoice").where("invoice_id", req.params.invoice_id).update({
                        table_num: req.body.new_table
                    }).then(() => {
                        db("tbl_tables").where("table_num", req.body.old_table).update({
                            state: "0"
                        }).then(() => {
                            req.app.io.emit("settedNull", req.body.old_table);
                            db("tbl_tables").where("table_num", req.body.new_table).update({
                                state: "2"
                            }).then(() => {
                                req.app.io.emit("taked", req.body.new_table);
                                return res.status(200).json({
                                    message: "Table Changed"
                                });
                            });
                        });
                    });
                }
            });
        } else {
            return res.status(500).json({
                message: "ناتوانیت مـێزەکە بگۆڕیت"
            });
        } 
        
    });
});

module.exports = router;