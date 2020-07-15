const express = require("express");
const router = express.Router();
const { db } = require("../DB/db_config");
const {
  createValidation,
  deleteValidation,
  updateValidation,
} = require("../validators/tables");

router.post("/addTable", (req, res) => {
  db("tbl_tables")
    .insert({
      table_id: req.body.table_id,
      table_num: req.body.table_num,
      position: req.body.position,
      state: req.body.state,
      type: req.body.type,
    })
    .then((data) => {
      return res.json({
        message: "1 Table Added",
        data,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

router.patch("/updateTable/:id", (req, res) => {
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
      res.status(500).send();
    });
});

router.delete("/deleteTable/:id", async (req, res) => {
  // try {
  //   const delTable = await db("tbl_tables")
  //     .where("table_id", req.params.id)
  //     .del();
  //     if(!delTable){
  //       res.status(404).send('user not found')
  //     }
  //   res.status(200).send();
  // } catch (err) {
  //   res.status(400).send(err);
  // }
  db("tbl_tables")
    .where("table_id",req.params.id)
    .del()
    .then((result) => {
      return res.json({
        message: result + " table deleted",
      });
    })
    .catch((err) => {
      res.status(500).send({ error: err });
    });
});

module.exports = router;
