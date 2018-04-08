
// Madison Kalivoda | MongoDB-WebScraper

var mongoose = require('mongoose');
var Note = require("./Note.js");

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
    // Create a relation with the Note model
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]

});

//Create Article model 
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;