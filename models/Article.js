var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

//export model
module.exports = Article;







/*// Madison Kalivoda | MongoDB-WebScraper

var mongoose = require('mongoose');
var Note = require("./Note.js");

var moment = require('moment');
// Create Schema class
var Schema = mongoose.Schema;

// Create Article Schema 
var ArticleSchema = new Schema({
   
    // Title of Article
    title: {
        type: String,
        required: true
    },
    // Link to Article
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        require: true
    },
    updated: {
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm A')
    },

    // Create a relation with the Note model
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

//Create Article model 
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;*/