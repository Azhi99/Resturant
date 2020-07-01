const express = require("express");
require("dotenv").config();

const { db } = require("./DB/db_config.js"); 
const userRouter = require("./routes/user.js");
const foodTypesRouter = require("./routes/food_types.js");
const foodsRouter = require("./routes/foods.js");
const expenseRouter = require("./routes/expense.js");
const deliveryRouter = require("./routes/delivery.js");
const dollarRouter = require("./routes/dollar.js");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/user", userRouter);
app.use("/food_type", foodTypesRouter);
app.use("/foods", foodsRouter);
app.use("/expense", expenseRouter);
app.use("/delivery", deliveryRouter);
app.use("/dollar", dollarRouter);

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
