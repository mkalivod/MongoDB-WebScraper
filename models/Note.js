
// Madison Kalivoda | MongoDB-WebScraper

// Require mongoose 
var mongoose = require("mongoose");

// Create a Schema Class
var Schema = mongoose.Schema;

// Create Note Schemaa
var NoteSchema = new Schema({

    // Note Title/Heading 
    title: {
        type: String
    },

    // Content of Note
    content: {
        type: String
    }

});

// Create the Note model 
var Note = mongoose.model("Note", NoteSchema);

// Export the model
module.exports = Note;