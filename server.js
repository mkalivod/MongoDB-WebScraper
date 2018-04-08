
// Madison Kalivoda | MongoDB-WebScraper

// Dependencies 
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

var logger = require("morgan"); // for debugging
var request = require("request"); // for web-scraping 
var cheerio = require("cheerio"); // for web-scraping

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Serve static content
app.use(express.static(process.cwd() + "/public"));

// Express-Handlebars 
var expressHandlebars = require("express-handlebars");

app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Database configuration with Mongoose 
mongoose.Promise = Promise;

//"mongodb://heroku_z4dsc2bl:27joihlbph5u58atuskkb9ebpr@ds237379.mlab.com:37379/heroku_z4dsc2bl"


var localDB = 'mongodb://localhost:27017/webscraper';
var MONGODB_URI = process.env.MONGODB_URI || localDB;

mongoose.connect(MONGODB_URI); // connect to local host if not a production environment


var db = mongoose.connection;

db.on("error", function (error) {
    console.log("Mongoose connection error: ", error);
});

db.once("open", function () {
    console.log("Successful Mongoose connection!");
});

// Import Article/Note models 
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");


// Import Routes/Controller
var router = require("./controllers/controller.js");
app.use("/", router);

// Launch App 
app.listen(PORT, function () {
    console.log('App is running on PORT: ' + PORT);
});