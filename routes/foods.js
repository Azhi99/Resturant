const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { db } = require("../DB/db_config");
const { createValidation, deleteValidation, updateValidation } = require("../validators/foods.js");
const router = express.Router();

router.use(fileUpload());

router.post("/getData", (req, res) => {
    db.select(
      "tbl_foods.food_id as food_id",
      "tbl_foods.food_name as food_name",
      "tbl_food_types.type_name as food_type",
      "tbl_foods.price as price",
      "tbl_users.full_name as username",
      "tbl_foods.image as image_path",
      "tbl_foods.note as note",
      "tbl_foods.color_value as color_value"
    )
      .from("tbl_foods")
      .join("tbl_food_types", "tbl_food_types.type_id", "=", "tbl_foods.type_id")
      .join("tbl_users", "tbl_users.user_id", "=", "tbl_foods.user_id")
      .orderBy("tbl_foods.food_id", "desc").then((data)=>{
        return res.status(200).send(data);
      }).catch((err) => {
        return res.status(500).json({
            message: err
        });
      });
});

router.post("/getDataByType/:type_id", (req, res) => {
    db.select(
      "tbl_foods.food_id as food_id",
      "tbl_foods.food_name as food_name",
      "tbl_foods.price as price",
      "tbl_foods.image as image_path",
      "tbl_foods.color_value as color_value"
    )
      .from("tbl_foods")
      .where("type_id", req.params.type_id)
      .orderBy("tbl_foods.food_id", "desc").then((data)=>{
        return res.status(200).send(data);
      }).catch((err) => {
        return res.status(500).json({
            message: err
        });
      });
});

router.post("/addFood", createValidation, (req,res)=>{
    var image_path = null;
    if(req.files && req.files.food_image != null){
        var image_name = req.files.food_image.name;
        const ext = image_name.substring( image_name.lastIndexOf('.') + 1 );
        if(["jpg", "png", "jpeg"].includes(ext.toLowerCase())){
            req.files.food_image.name = new Date().getTime() + "." + ext;
            image_name = req.files.food_image.name;
            image_path = "./food_images/"+image_name;
        } else {
            return res.status(500).json({
                message: "جۆری فایلی هەڵبژێردراو هەڵەیە"
            });
        }
    } 
    if(req.body.color_value == "null"){
        req.body.color_value = null;
    }
    db("tbl_foods").insert({
        food_name: req.body.food_name,
        type_id: req.body.type_id,
        price: req.body.price,
        user_id: req.body.user_id,
        image: image_path,
        note: req.body.note,
        color_value: req.body.color_value
    }).then(([data])=>{ 
        if(image_path != null){
            req.files.food_image.mv("./public/food_images/" + req.files.food_image.name, async function(err){
                if(err){
                    const deleted = await db("tbl_foods").where("food_id", data).del();
                    if(deleted){
                        return res.status(500).json({
                            message: err
                        });
                    }
                }
            });
        }
        return res.status(200).json({
            message: "1 Food Added",
            food_id: data,
            image_path
        });
        
    }).catch((err)=>{
        if(err.errno === 1062){
            return res.status(500).json({ 
                message: "ئەم خواردنە پێشتر داخڵ کراوە" 
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
                message: "ئەم خواردنە پێشتر داخڵ کراوە"
            });
        }
        return res.status(500).json({
            message: err
        });
    });
});

router.patch("/updateImage/:id", deleteValidation, (req,res) => {
    if(!req.files || req.files.food_image == null){
        return res.status(500).json({
            message: "هیچ ڕەسمێک هەڵنەبژێردراوە"
        });
    }
    let food_image = req.files.food_image;
    let image_name = food_image.name;
    const ext = image_name.substring( image_name.lastIndexOf('.') + 1 );
    if(!["jpg", "png", "jpeg"].includes(ext.toLowerCase())){
        return res.status(500).json({
            message: "جؤری فایلی هەڵبژێردراو هەڵەیە"
        });
    }
    food_image.name = new Date().getTime() + "." + ext;
    image_name = food_image.name;
    food_image.mv("./public/food_images/" + image_name, async (err) => {
        if(err){
            return res.status(500).json({
                message: err
            });
        }
        const [{image_path}] = await db("tbl_foods").where("food_id", req.params.id).select(["image as image_path"]).limit(1);
        if(image_path){
            fs.unlinkSync("./public" + image_path.slice(1));
        }
        db("tbl_foods").where("food_id", req.params.id).update({
            image: "./food_images/" + image_name
        }).then(()=>{
            return res.status(200).json({
                image_path: "./food_images/" + image_name
            });
        }).catch((err) => {
            return res.status(500).json({
                message: err
            });
        });
    });
});



// data is the number of deleted rows
router.delete("/deleteFood/:id", deleteValidation, async (req,res) => {
    const [{image_path}] = await db("tbl_foods").where("food_id", req.params.id).select(["image as image_path"]).limit(1);
    if(image_path){
        fs.unlinkSync("./public" + image_path.slice(1));
    }
    db("tbl_foods").where("food_id", req.params.id).del().then((data) => {
        return res.json({
            message: data + " Food deleted"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

router.delete("/deleteImage/:id", deleteValidation, async (req,res) => {
    const [{image_path}] = await db("tbl_foods").where("food_id", req.params.id).select(["image as image_path"]).limit(1);
    if(image_path){
        fs.unlinkSync("./public" + image_path.slice(1));
    }
    db("tbl_foods").where("food_id", req.params.id).update({
        image: null
    }).then(() => {
        return res.json({
            message: "Image Successfully Deleted"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

module.exports = router;