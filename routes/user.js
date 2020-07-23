const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { db } = require("../DB/db_config.js");
const { createValidation } = require("../validators/user.js");

router.post("/addUser",createValidation, (req, res) => {
    var password = req.body.password;
    bcrypt.hash(password, 10, (err, hash)=>{
        db("tbl_users").insert({
            username: req.body.username,
            password: hash,
            full_name: req.body.full_name,
            role: req.body.role,
            status: req.body.status,
            reg_date: req.body.reg_date,
            phone: req.body.phone
            // Image Upload  
        }).then((data)=>{
            return res.json({ message: "1 User Added", user: data });
        }).catch((err)=>{
            return res.json({ message: err });
        });
    });
    
});


router.delete("/deleteUser/:id", (req,res)=>{
    db("tbl_users").where("user_id", req.params.id).del().then(()=>{
        return res.json({message: "1 User Deleted"});
    }).catch((err)=>{
        return res.json({message: err});
    });
});

module.exports = router;