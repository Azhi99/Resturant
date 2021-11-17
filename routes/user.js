const express = require("express");
const bcrypt = require("bcryptjs");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const router = express.Router();

const { db } = require("../DB/db_config.js");
const { createValidation, updateValidation, checkID, checkPassword } = require("../validators/user.js");

router.use(fileUpload());

router.post("/getData", (req, res) => {
    db("tbl_users").select(["user_id","username","full_name","role","status","reg_date","phone","image as image_path"]).orderBy("user_id", "desc").then((data) => {
        return res.status(200).send(data);
    });
});

router.post("/getUserImage/:id", async (req,res) => {
    const [{image}] = await db("tbl_users").where("user_id", req.params.id).select(["image"]).limit(1);
    return res.status(200).json({
        image_path: image
    });
});

router.post("/getUserRoles/:id", async (req,res) => {
    const [{roles}] = await db("tbl_roles").where("user_id", req.params.id).select(["roles"]).limit(1);
    return res.status(200).json({
        roles
    });
});


/* 
    First check if user have image or not 
    If have image then check image is validate or not, if image is validate then change the name and giving the 
    access path to a variable by access folder and image name 
    If don't have image then a variable is null 
    This variable that refer to image path is inserting to the database (null or have a path)
    After inserting user to the database, then check this path have or not 
    If path is not null then upload the image to user_images folder
    If during upload an error occured then deleted the inserted user and say error
    If the image uploaded successfully then say 1 user added
*/ 
router.post("/addUser", createValidation, (req, res) => {
    var password = req.body.password;
    bcrypt.hash(password, 10, (err, hash)=>{
        var image_path = null;
        if(req.files && req.files.user_image != null){
            var image_name = req.files.user_image.name;
            const ext = image_name.substring( image_name.lastIndexOf('.') + 1 );
            if(["jpg", "png", "jpeg"].includes(ext.toLowerCase())){
                req.files.user_image.name = new Date().getTime() + "." + ext;
                image_name = req.files.user_image.name;
                image_path = "./user_images/"+image_name;
            } else {
                return res.status(500).json({
                    message: "جۆری فایلی هەڵبژێردراو هەڵەیە"
                });
            }
        } 
        db("tbl_users").insert({
            username: req.body.username,
            password: hash,
            full_name: req.body.full_name,
            role: req.body.role,
            status: "1",
            reg_date: db.fn.now(),
            phone: req.body.phone,
            image: image_path
        }).then(([data])=>{ 
            if(image_path != null){
                req.files.user_image.mv("./public/user_images/" + req.files.user_image.name, async function(err){
                    if(err){
                        const deleted = await db("tbl_users").where("user_id", data).del();
                        if(deleted){
                            return res.status(500).json({
                                message: err
                            });
                        }
                    }
                });
            }
            return res.status(200).json({
                message: "1 User Added",
                user_id: data,
                image_path
            });
            
        }).catch((err)=>{
            return res.status(500).json({ 
                message: err 
            });
        });
    });
    
});

router.patch("/updateUser/:id", checkID, updateValidation, (req,res) => {
    db("tbl_users").where("user_id", req.params.id).update({
        username: req.body.username,
        full_name: req.body.full_name,
        role: req.body.role,
        phone: req.body.phone
    }).then(() => {
        return res.status(200).json({
            message: "User Successfully Updated"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

router.patch("/updatePassword/:id", checkID, checkPassword, (req,res) => {
    bcrypt.hash(req.body.password, 10, (err, hash)=>{
        db("tbl_users").where("user_id", req.params.id).update({
            password: hash
        }).then(()=>{
            return res.status(200).json({
                message: "Password Updated"
            });
        }).catch((err) => {
            return res.status(500).json({
                message: err
            });
        });
    });
});

/*
    First of all check have image or not, if have image then check the image is valid or not
    If the image is valid then change the name 
    Upload the image, if don't have error during upload then select image from database to the specific user by id 
    If the user have image, delete image
    Finally update the image in database
*/
router.patch("/updateImage/:id", checkID, (req,res) => {
    if(!req.files || !req.files.user_image){
        return res.status(500).json({
            message: "هیچ وێنەیەک هەڵنەبژێردراوە"
        });
    }
    let user_image = req.files.user_image;
    let image_name = user_image.name;
    const ext  = image_name.substring( image_name.lastIndexOf('.') + 1 );
    if( !["jpg","png", "jpeg"].includes( ext.toLowerCase() ) ){
        return res.status(500).json({
            message: "جۆری ڕەسمەکە هەڵەیە"
        });
    }
    user_image.name = new Date().getTime() + "." + ext;
    image_name = user_image.name;
    user_image.mv("./public/user_images/" + user_image.name, async (err) => {
        if(err){
            return res.status(500).json({
                message: err
            });
        }
        const [{image_path}] = await db("tbl_users").where("user_id", req.params.id).select(["image as image_path"]).limit(1);
        if(image_path){
            fs.unlinkSync("./public" + image_path.slice(1));
        }
        db("tbl_users").where("user_id", req.params.id).update({
            image: "./user_images/" + user_image.name
        }).then(()=>{
            return res.status(200).json({
                message: "Image Successfully Updated",
                image_path: "./user_images/" + user_image.name
            });
        }).catch((err) => {
            return res.status(500).json({
                message: err
            });
        });
    });
});

router.patch("/disableUser/:id", checkID, async (req,res) => {
    const [{noOfActivedAdmin}] = await db("tbl_users").where("role","Admin").andWhere("status", 1).count("user_id as noOfActivedAdmin");
    const [{userType}] = await db("tbl_users").where("user_id", req.params.id).select(["role as userType"]).limit(1);
    if(noOfActivedAdmin == 1 && userType == "Admin"){
        return res.status(500).json({
            message: "ناتوانیت ئەم بەکارهێنەرە قفڵ بکەیت"
        });
    } 
    db("tbl_users").where("user_id", req.params.id).update({
        status: "0"
    }).then(()=>{
        return res.status(200).json({
            message: "Account Disabled"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
    
});

router.patch("/activeUser/:id", checkID, (req,res) => {
    db("tbl_users").where("user_id", req.params.id).update({
        status: "1"
    }).then(()=>{
        return res.status(200).json({
            message: "Account Disabled"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

router.delete("/deleteUser/:id", checkID, async (req,res)=>{
    const [{noOfAdmins}] = await db("tbl_users").where("role","Admin").count("user_id as noOfAdmins");
    const [{userType}] = await db("tbl_users").where("user_id", req.params.id).select(["role as userType"]).limit(1);
    if(noOfAdmins == 1 && userType == "Admin"){
        return res.status(500).json({
            message: "ناتوانیت ئەم بەکارهێنەرە بسڕیتەوە"
        });
    }
    db("tbl_users").where("user_id", req.params.id).select(["image"]).limit(1).then(([data])=>{
        const image = data.image;
        if(image){
            fs.unlinkSync("./public" + image.slice(1));
        }
        db("tbl_roles").where("user_id", req.params.id).del().then(()=>{
            db("tbl_users").where("user_id", req.params.id).del().then(()=>{
                return res.status(200).json({message: "1 User Deleted"});
            }).catch((err)=>{
                if(err.errno === 1451){
                    return res.status(500).json({message: "ناتوانیت ئەم بەکارهێنەرە بسڕیتەوە لەبەرئەوەی لە بەشەکانی تردا بەکارهاتووە"});
                }
                return res.status(500).json({message: err});
            });
        });
    });
});

router.delete("/deleteImage/:id", checkID, async (req, res) => {
    const [{image_path}] = await db("tbl_users").where("user_id", req.params.id).select(["image as image_path"]).limit(1);
    if(!image_path){
        return res.status(500).json({
            message: "ئەم بەکارهێنەرە وێنەی نییە"
        });
    }
    fs.unlinkSync("./public/" + image_path.slice(1));
    db("tbl_users").where("user_id", req.params.id).update({
        image: null
    }).then(() => {
        return res.status(200).json({
            message: "Image deleted"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: err
        });
    });
});

module.exports = router;