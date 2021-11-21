const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const socketio = require("socket.io");
const mysqldump = require("mysqldump");
const session = require("client-sessions");
const path = require('path');
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


const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');

// Select the adapter based on your printer type

var device  = new escpos.USB('1155','22339');

// var device  = new escpos.Network('192.168.1.100');
 
var options = { encoding: "UTF-16" }
 

var fs = require('fs');
var text2png = require('text2png');

var printer = new escpos.Printer(device, options);

function printInvoice(fileName) {
  device  = new escpos.USB('1155','22339');
   
   options = { encoding: "UTF-16"}
    printer = new escpos.Printer(device, options);
    const tux = path.join(__dirname, fileName + '.png');
    escpos.Image.load(tux, function(image){
    device.open(function(){
         printer.align('ct')
            .image(image,'d24')
            .then(() => { 
                printer.cut().close();
            });
    });

    });
}


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
  origin: ['http://192.168.1.5:8080', 'http://192.168.1.9:8080', 'http://192.168.1.2:8080'],
  credentials: true
}));
app.use(express.static("public"));

app.use(session({
  cookieName: "session",
  secret: "suly_tech_staff",
  duration: 12 * 60 * 60 * 1000,
  activeDuration: 10 * 60 * 60 * 1000
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

const nodeHtmlToImage = require('node-html-to-image')

app.post("/print", (req, res) => {
  // let text = '';
  // text += 'مێزی: ' + req.body.tableNum;
  // text += '\t';
  // text += 'وەصڵی ژمارە: ' + req.body.invoiceNumber;
  // text += ' \n\n --------------------------------------- \n ';
  // for(let food of req.body.foods) {
  //   text += food.qty + ' ' + food.food_name + ' \n\n';
  // }
  // fs.writeFileSync( req.body.invoiceNumber + '.png', text2png(text, {color: 'black', padding: 40}));
   let html = '<html> <head> <meta charset="utf-8"> </head> <body> ';
   html += '<table style="border: 1px solid; font-size: 32px; width: 73.5%;">';
   html += '<tbody>';
   html += '<tr style="border: 1px solid;">';
   html += `<td style="border: 1px solid; padding: 8px 5px; text-align: center;"> مێزی: ${req.body.tableNum} </td>`;
   html += `<td style="border: 1px solid; padding: 8px 5px; text-align: center;"> وەصڵی ژمارە: ${req.body.invoiceNumber} </td>`;
   html += '</tr>';
   html += '</tbody>';
   html += '</table>';

   html += "<hr>"

   html += '<table style="font-size: 32px; width: 73.5%;">';
   html += '<thead>';
   html += '<tr style="border: 1px solid;">';
   html += `<th style="border: 1px solid; padding: 8px 5px; text-align: center;"> دانـــە </th>`;
   html += `<th style="border: 1px solid; padding: 8px 5px; text-align: center;"> خواردن </th>`;
   html += '</tr>';
   html += '<tbody>';
    for(let food of req.body.foods) {
      html += '<tr style="border: 1px solid;">';
      html += `<td style="border: 1px solid; padding: 8px 5px; text-align: center;"> ${food.qty} </td>`;
      html += `<td style="border: 1px solid; padding: 8px 5px; text-align: center;"> ${food.food_name} </td>`;
      html += '</tr>'

      html += '<tr style="border: 1px solid;">';
      html += `<td style="border: 1px solid; padding: 8px 5px; text-align: center;" colspan="2"> ١ دانە پیازی زۆربێ </td>`;
      html += '</tr>'

    }
   html += '</tbody>';
   html += '</thead>';
   html += '</table>';

  
  
   html += '</body></html>'

   nodeHtmlToImage({
    output: `./${req.body.invoiceNumber}.png`,
    html
  }).then(() => {
    console.log('Success');
    printInvoice(req.body.invoiceNumber);
  })

  
  
  
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

