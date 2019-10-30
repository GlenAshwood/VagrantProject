var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var ip = process.env.IP || "127.0.0.1";

var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log(addresses);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// render landing page
app.get("/", function(req, res){
    res.render("landing" , {localIP: addresses[1]});
});

app.get("/test", function(req, res){
    res.send("IP " + addresses[1] + " Is responding to HTTP Requests");
});

app.listen(port, function() {
    console.log('Ready on port ' + ip  + ' ' + port);
});
