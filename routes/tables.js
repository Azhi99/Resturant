const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config.js");
const {
  createValidation,
  deleteValidation,
  updateValidation,
  checkNum
} = require("../validators/tables");

router.post("/getData", function(req, res) {
  db("tbl_tables").select(["table_num", "position", "state", "type"]).then((data) => {
    return res.status(200).send(data);
  }).catch((err) => {
    return res.status(500).json({
      message: err
    });
  });
});

router.post("/addTable", createValidation, (req, res) => {
  db("tbl_tables")
    .insert({
      table_num: req.body.table_num,
      position: req.body.position,
      state: "0",
      type: req.body.type,
    })
    .then(([data]) => {
      return res.json({
        message: "1 Table Added",
        table_id: data,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

router.patch("/updateTable/:id", updateValidation, (req, res) => {
  db("tbl_tables")
    .where("table_id", req.params.id)
    .update({
      table_num: req.body.table_num,
      position: req.body.position,
      state: req.body.state,
      type: req.body.type,
    })
    .then((result) => {
      return res.json({
        message: result + " table updated",
      });
    })
    .catch((err) => {
      return res.status(500).send({
        message: err
      });
    });
});

router.delete("/deleteTable/:id", deleteValidation, (req, res) => {
  db("tbl_tables")
    .where("table_id", req.params.id)
    .del()
    .then((result) => {
      return res.json({
        message: result + " table deleted",
      });
    })
    .catch((err) => {
      return res.status(500).send({ message: err });
    });
});

router.patch("/preOrder/:num", checkNum, (req, res) => {
  db("tbl_tables").where("table_num", req.params.num).update({
    state: "1"
  }).then(function() {
    req.app.io.emit("preOrdered", req.params.num);
    return res.status(200).json({
      message: "Success"
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({
      message: err
    });
    
  });
});

router.patch("/setNull/:num", checkNum, (req, res) => {
  db("tbl_tables").where("table_num", req.params.num).update({
    state: "0"
  }).then(() => {
    req.app.io.emit("settedNull", req.params.num);
    return res.status(200).json({
      message: "Success"
    });
  }).catch((err) => {
    return res.status(500).json({
      message: err
    });
    
  });
});

module.exports = router;
