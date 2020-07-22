const express = require("express");
const router = express.Router();

const { db } = require("../DB/db_config.js");
const {
  createValidation,
  deleteValidation,
  updateValidation,
} = require("../validators/food_types.js");

router.post("/addFoodType", createValidation, (req, res) => {
  db("tbl_food_types")
    .insert({
      type_name: req.body.type_name,
    })
    .then(([data]) => {
      return res.json({
        message: "1 Type Added",
        type_id: data,
      });
    })
    .catch((err) => {
      if (err.errno === 1062) {
        return res.status(500).json({
          message: "ئەم جۆرە داخڵ کراوە",
        });
      }
      return res.status(500).json({
        message: err,
      });
    });
});

// data is the number of updates rows
router.patch( "/updateFoodType/:id", updateValidation, createValidation, (req, res) => {
    db("tbl_food_types")
      .where("type_id", req.params.id)
      .update({
        type_name: req.body.type_name,
      })
      .then((data) => {
        return res.json({
          message: data + " Type Updated",
        });
      })
      .catch((err) => {
        if (err.errno === 1062) {
          return res.status(500).json({
            message: "ئەم جۆرە داخڵ کراوە",
          });
        }
        return res.status(500).json({
          message: err,
        });
      });
  }
);

// data is the number of deleted rows
router.delete("/deleteFoodType/:id", deleteValidation, (req, res) => {
  db("tbl_food_types")
    .where("type_id", req.params.id)
    .del()
    .then((data) => {
      return res.json({
        message: data + " Type Deleted",
      });
    });
});

module.exports = router;
