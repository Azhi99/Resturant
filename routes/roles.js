const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config");

router.post("/addRole", (req, res) => {
  db("tbl_roles")
    .insert({
      role_id: req.body.role_id,
      user_id: req.body.user_id,
      roles: req.body.roles,
    })
    .then((result) => {
      res.status(201).json({
        message: "1 role Added",
        result,
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.patch("/updateRole/:id", (req, res) => {
  db("tbl_roles")
    .where("role_id", req.params.id)
    .update({
      user_id: req.body.user_id,
      roles: req.body.roles,
    })
    .then((result) => {
      res.status(200).json({
        message: result + " role updated",
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.delete("/deleteRole/:id", (req, res) => {
  db("tbl_roles")
    .where("role_id", req.params.id)
    .del()
    .then((result) => {
      res.status(200).json({
        message: result + "role deleted",
      });
    }).catch((err)=>{
        res.status(500).send(err)
    })
});

module.exports = router;
