const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');
const path = require('path');

// Select the adapter based on your printer type
const device  = new escpos.USB('1155','22339');
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
 
const options = { encoding: "UTF-16" /* default */ }
// encoding is optional
 
const printer = new escpos.Printer(device, options);
var fs = require('fs');
var text2png = require('text2png');
fs.writeFileSync('a.png', text2png('مێزی 2 \t وەصڵی ژمارە 25  \n\n --------------------------------------- \n قۆزی 3 \n\n کەباب 4', {color: 'black',padding: 40}));
printInvoice();
function printInvoice() {
    const tux = path.join(__dirname, 'a.png');
    escpos.Image.load(tux, function(image){

    device.open(function(){

        printer.align('ct')
            .image(image,'d24')
            .then(() => { 
                printer.cut().close(); 
            });

        // OR non-async .raster(image, "mode") : printer.text("text").raster(image).cut().close();

    });

    });
}