const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const {jsPDF} = require("jspdf");
require("dotenv").config();
const socketio = require("socket.io");
const mysqldump = require("mysqldump");
const session = require("express-session");
const path = require('path');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const opn = require("opn");

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
const { db } = require("./DB/db_config.js");

let printer = new ThermalPrinter({                               
  interface: 'printer:POS-80-Series',  
  driver: require('printer'),
  characterSet: 'PC850_MULTILINGUAL',
  type: PrinterTypes.EPSON,     
  removeSpecialCharacters: false,                           
  lineCharacter: "_",                                       
});


const app = express();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  // opn("http://localhost:3000");
  console.log(`Server started at port ${port}`);
});

const io = socketio(server);
app.io = io;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    "http://localhost:8080"
  ],
  credentials: true
}));
app.use(express.static("public"));

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: "suly_rest_db"
}));

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


app.post("/login", (req, res) => {
  if(!req.session.isLogged){
    db("tbl_users").where("username", (req.body.username).trim()).select(["password", "user_id", "full_name", "role"]).limit(1).then(([data]) => {
      if(typeof data != "undefined"){
        bcrypt.compare((req.body.password).trim(), data.password, (err, result) => {
          if(result){
            req.session.isLogged = true;
            req.session.username = req.body.username.trim();
            req.session.user_id = data.user_id;
            req.session.full_name = data.full_name;
            req.session.role = data.role;
            if(data.role == "User"){
              db("tbl_roles").where("user_id", data.user_id).select(["roles"]).limit(1).then(([{roles}]) => {
                req.session.user_roles = roles.split(",");
                return res.status(200).json({
                  message: "Login Success"
                });
              });
            } else {
              return res.status(200).json({
                message: "Login Success"
              });
            }
          } else {
            return res.status(500).json({
              message: "وشەی نهێنی هەڵەیە"
            });
          }
        });
      } else {
        return res.status(500).json({
          message: "ناوی بەکارهێنەر هەڵەیە"
        });
      }
    });
  }
});

app.post("/logout", (req, res) => {
  user_roles = [];
  req.session.destroy();
  return res.status(200).json({
    message: "Logout Success"
  });
});

app.post("/isLogged", (req, res) => {
  if(req.session.user_id > 0){
    return res.status(200).json({
      message: "Logged",
      user_type: req.session.role,
      user_roles: req.session.user_roles
    });
  } else {
    return res.status(200).json({
      message: "Not Logged"
    });
  }
});

app.post("/getUser", (req, res) => {
  if(req.session.user_id > 0){
    return res.status(200).json({
      user_id: req.session.user_id,
      username: req.session.full_name
    });
  }
});

app.post("/print", (req, res) => {
  console.log(req.body.doc);
  var doc = new jsPDF();
  doc = {...req.body.doc}
  doc.save('./test.pdf')
  return res.sendStatus(200);
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

