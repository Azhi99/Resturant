const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { db } = require("./DB/db_config.js");
const userRouter = require("./routes/user.js");
const foodTypesRouter = require("./routes/food_types.js");
const foodsRouter = require("./routes/foods.js");
const expenseRouter = require("./routes/expense.js");
const deliveryRouter = require("./routes/delivery.js");
const dollarRouter = require("./routes/dollar.js");
const tablesRouter = require("./routes/tables.js");
const rolesRouter = require("./routes/roles");
const invoiceRouter=require('./routes/invoice');
const indexRouter = require("./routes/indexPage");
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

app.use("/user", userRouter);
app.use("/food_type", foodTypesRouter);
app.use("/foods", foodsRouter);
app.use("/expense", expenseRouter);
app.use("/delivery", deliveryRouter);
app.use("/dollar", dollarRouter);
app.use("/tables", tablesRouter);
app.use("/roles", rolesRouter);
app.use('/invoice',invoiceRouter);
app.use('/index',indexRouter);


app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
