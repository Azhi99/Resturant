const express = require("express");
const router = express.Router();
const { createValidation, updateValidation, deleteValidation } = require("../validators/roles.js");
const { db } = require("../DB/db_config");

router.post("/addRole", createValidation, (req, res) => {
  db("tbl_roles")
    .insert({
      user_id: req.body.user_id,
      roles: req.body.roles,
    })
    .then((result) => {
      return res.status(200).json({
        message: "1 role Added",
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err
      });
    });
});

router.patch("/updateRole/:id", updateValidation, (req, res) => {
  db("tbl_roles")
    .where("role_id", req.params.id)
    .update({
      user_id: req.body.user_id,
      roles: req.body.roles,
    })
    .then((result) => {
      return res.status(200).json({
        message: result + " role updated",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err
      });
    });
});

router.delete("/deleteRole/:id", deleteValidation, (req, res) => {
  db("tbl_roles")
    .where("role_id", req.params.id)
    .del()
    .then((result) => {
      return res.status(200).json({
        message: result + "role deleted",
      });
    }).catch((err)=>{
      return res.status(500).send({
        message: err
      })
    })
});

module.exports = router;
