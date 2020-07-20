const express = require("express");
const { db } = require("../DB/db_config");
const { createValidation, deleteValidation, updateValidation } = require("../validators/foods.js");
const router = express.Router();

router.post("/addFood", createValidation, (req,res)=>{
    // Upload image before insert 
    db("tbl_foods").insert({
        food_name: req.body.food_name,
        type_id: req.body.type_id,
        price: req.body.price,
        user_id: req.body.user_id,
        image: req.body.image,
        note: req.body.note,
        color_value: req.body.color_value
    }).then((data) => {
        return res.json({
            message: "1 Food Added",
            data
        });
    }).catch((err) => {
        if(err.errno === 1062){
            return res.status(500).json({
                message: "This food already exist"
            });
        }
        return res.status(500).json({
            message: err
        });
    });
});

// data is the number of updated rows
router.patch("/updateFood/:id", updateValidation, (req,res) => {
    db("tbl_foods").where("food_id", req.params.id).update({
        food_name: req.body.food_name,
        type_id: req.body.type_id,
        price: req.body.price,
        note: req.body.note,
        color_value: req.body.color_value
    }).then((data)=>{
        return res.json({
            message: data + " Food Updated"
        });
    }).catch((err) => {
        if(err.errno === 1062){
            return res.status(500).json({
                message: "This food already exist"
            });
        }
        return res.status(500).json({
            message: err
        });
    });
});

// data is the number of deleted rows
router.delete("/deleteFood/:id", deleteValidation, (req,res) => {
    // Remove image before delete
    db("tbl_foods").where("food_id", req.params.id).del().then((data) => {
        return res.json({
            message: data + " Food deleted"
        });
    });
});

module.exports = router;