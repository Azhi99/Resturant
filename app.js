const express = require("express");
const cors = require("cors");
require("dotenv").config();
const socketio = require("socket.io");
const mysqldump = require("mysqldump");

const userRouter = require("./routes/user.js");
const foodTypesRouter = require("./routes/food_types.js");
const foodsRouter = require("./routes/foods.js");
const expenseRouter = require("./routes/expense.js");
const deliveryRouter = require("./routes/delivery.js");
const dollarRouter = require("./routes/dollar.js");
const tablesRouter = require("./routes/tables.js");
const rolesRouter = require("./routes/roles.js");
const invoiceRouter=require('./routes/invoice.js');
const cashierRouter = require("./routes/cashier.js");
const indexRouter = require("./routes/indexPage.js");

const app = express();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});

const io = socketio(server);
app.io = io;

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
app.use('/invoice', invoiceRouter);
app.use('/cashier', cashierRouter);
app.use('/index', indexRouter);

app.get("/backup", (req,res) => {
  mysqldump({
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    },
    dumpToFile: "./suly_rest.sql"
  });
});
