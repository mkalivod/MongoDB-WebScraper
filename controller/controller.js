//dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//Require models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

//index
router.get('/', function (req, res) {
    res.redirect('/articles');
});


// A GET request to scrape the Verge website
router.get('/scrape', function (req, res) {
    // First, we grab the body of the html with request
    request('', function (error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        var titlesArray = [];
        // Now, we grab every article
        $("div.js-trackedPost").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            const headline = $(element).find("h3").text();
            const summary = $(element).find("h4").text();

            //ensures that no empty title or links are sent to mongodb
            if (result.title !== "" && result.link !== "") {
                //check for duplicates
                if (titlesArray.indexOf(result.title) == -1) {

                    // push the saved title to the array 
                    titlesArray.push(result.title);

                    // only add the article if is not already there
                    Article.count({ title: result.title }, function (err, test) {
                        //if the test is 0, the entry is unique and good to save
                        if (test == 0) {

                            //using Article model, create new object
                            var entry = new Article(result);

                            //save entry to mongodb
                            entry.save(function (err, doc) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            });

                        }
                    });
                }
                // Log that scrape is working, just the content was missing parts
                else {
                    console.log('Article already exists.')
                }

            }
            // Log that scrape is working, just the content was missing parts
            else {
                console.log('Not saved to DB, missing data')
            }
        });
        // after scrape, redirects to index
        res.redirect('/');
    });
});

//this will grab every article an populate the DOM
router.get('/articles', function (req, res) {
    //allows newer articles to be on top
    Article.find().sort({ _id: -1 })
        //send to handlebars
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                var artcl = { article: doc };
                res.render('index', artcl);
            }
        });
});

// This will get the articles we scraped from the mongoDB in JSON
router.get('/articles-json', function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

//clear all articles for testing purposes
router.get('/clearAll', function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('removed all articles');
        }

    });
    res.redirect('/articles-json');
});

router.get('/readArticle/:id', function (req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };

    // //find the article at the id
    Article.findOne({ _id: articleId })
        .populate('comment')
        .exec(function (err, doc) {
            if (err) {
                console.log('Error: ' + err);
            } else {
                hbsObj.article = doc;
                var link = doc.link;
                //grab article from link
                request(link, function (error, response, html) {
                    var $ = cheerio.load(html);

                    $('.l-col__main').each(function (i, element) {
                        hbsObj.body = $(this).children('.c-entry-content').children('p').text();
                        //send article body and comments to article.handlbars through hbObj
                        res.render('article', hbsObj);
                        //prevents loop through so it doesn't return an empty hbsObj.body
                        return false;
                    });
                });
            }

        });
});

// Create a new comment
router.post('/comment/:id', function (req, res) {
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    //submitted form
    var commentObj = {
        name: user,
        body: content
    };

    //using the Comment model, create a new comment
    var newComment = new Comment(commentObj);

    newComment.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id)
            console.log(articleId)
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { 'comment': doc._id } }, { new: true })
                //execute everything
                .exec(function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/readArticle/' + articleId);
                    }
                });
        }
    });
});

module.exports = router;






















/*// Madison Kalivoda | MongoDB-WebScraper

// Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var exphbs = require('express-handlebars');


var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Import Models
var Note = require('../models/Note.js');
var Article = require('../models/Article.js');


// RENDER INDEX PAGE
router.get('/', function (req, res, ) {

    // Scrape data
    res.redirect('/scrape');

});


// RENDER ARTICLES PAGE
router.get('/articles', function (req, res) {

    // Query MongoDB for all article entries 
    Article.find().sort({ _id: -1 }) // Sort article entries --> (sort newest to top, assuming Ids increment)

        // Populate the notes associated with an article
        .populate('notes')

        // Execute the query --> articles rendered by handlebars 
        .exec(function (err, doc) {

            if (err) {
                console.log(err);
                console.log("sucks");
            }
            else {
                var hbsObject = { articles: doc }
                res.render('index', hbsObject);
                // res.json(hbsObject)
            }
        });

});


// WEB SCRAPE ROUTE
router.get('/scrape', function (req, res) {

    // Grab website URL for scraping to be loaded into cheerio 
    request('http://www.theonion.com/', function (error, response, html) {

        var $ = cheerio.load(html);

        var titlesArray = [];

        // Grab article elements with .inner class 
        $('article .inner').each(function (i, element) {

            var result = {};

            // Article Title
            result.title = $(this).children('header').children('h2').text().trim() + ""; //convert to string for error handling later
            // Article Link 
            result.link = 'http://www.theonion.com' + $(this).children('header').children('h2').children('a').attr('href').trim();
            // Article Summary 
            result.summary = $(this).children('div').text().trim() + ""; // convert to string for error handling


            // ERROR HANDLING >> ENSURE NO EMPTY SCRAPES OR ARTICLE DUPLICATES IN DB
            if (result.title !== "" && result.summary !== "") {

                // NOTE: we created a tittlesArray to store scraped articles in an array until we can determine if they are duplicates or not. 

                // If the title of the article is new...
                if (titlesArray.indexOf(result.title) == -1) {

                    //... push the title into the array
                    titlesArray.push(result.title);

                    // Add unique(not duplicated) scraped articles to the db only
                    // the 'test' paramater references the count of mathcing documents in a database
                    Article.count({ title: result.title }, function (err, test) {

                        if (test == 0) { // If the count is 0, then the article is unique 

                            var entry = new Article(result);

                            // Save the  entry to MongoDB --> log entry saved to the db
                            entry.save(function (err, doc) {

                                if (err) {
                                    console.log(err);
                                    console.log("sucks");
                                }
                                else {
                                    console.log(doc); // log entry saved to db
                                }

                            });

                        }
                        else {
                            console.log('Redundant Database Content. Not saved to DB.')
                        }

                    });

                }
                else {
                    console.log('Article is not a valid entry for the DB.');
                }
            }
            else {
                console.log('Empty Scrape. Not valid entry for the DB.');
            }

        });

        // Redirect to the Articles Page
        res.redirect("/articles");

    });

});


// ADD NOTE ROUTE **API**
router.post('/add/note/:id', function (req, res) {

    // Collect article id
    var articleId = req.params.id;

    // Collect note title
    var noteTitle = req.body.title;

    // Collect content of the note
    var noteContent = req.body.note;

    var result = {
        title: noteTitle,
        content: noteContent
    };
    // Create a new Note instance with the result values
    var entry = new Note(result);

    // Save the entry to the database
    entry.save(function (err, doc) {
        // log any errors
        if (err) {
            console.log(err);
            console.log("sucks");
        }
        // Or, relate the note to the article
        else {
            // Push the new note to the list of notes for the article
            Article.findOneAndUpdate({ '_id': articleId }, { $push: { 'notes': doc._id } }, { new: true })
                // execute the above query
                .exec(function (err, doc) {
                    // log any errors
                    if (err) {
                        console.log(err);
                        console.log("sucks");
                    } else {
                        // Send Success Header
                        res.sendStatus(200);
                    }
                });
        }
    });

});


// DELETE NOTE ROUTE
router.post('/remove/note/:id', function (req, res) {

    var notetId = req.params.id;

    // Find and Delete the Note using the Id
    Comment.findByIdAndRemove(noteId, function (err, todo) {

        if (err) {
            console.log(err);
            console.log("sucks");
        }
        else {
            // Send Success Header
            res.sendStatus(200);
        }

    });

});

// Export Router to Server.js
module.exports = router;
*/