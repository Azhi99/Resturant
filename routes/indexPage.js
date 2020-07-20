const express = require("express");
const { db } = require("../DB/db_config");
const router = express.Router();

router.post("/getData", async (req,res) => {
    const [{daily_sold}] = await db("tbl_invoice").sum("amount_paid as daily_sold").limit(1);
    const [{no_of_users}] = await db("tbl_users").count("* as no_of_users").limit(1);
    const [{no_of_foods}] = await db("tbl_foods").count("* as no_of_foods").limit(1);
    const food_types = await db("tbl_food_types").select();
    const tables = await db("tbl_tables").select();
    const [dollar_price] = await db("tbl_dollar").select(["dinar", "last_update"]).where("dollar_id", 1).limit(1);
    res.status(200).json({
        daily_sold,
        no_of_users,
        no_of_foods,
        food_types,
        tables, 
        dollar_price
    });
});

module.exports = router;