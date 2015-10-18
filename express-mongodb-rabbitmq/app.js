var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var mongoose = require('mongoose');

// Configure data models
var models = require("./models/data_model")(mongoose);

// Configure web server
var app = express()
    .use(express.query())
    .use(cors())
    .use(bodyParser.json())
    .use(cookieParser());
var http = require('http').Server(app);

// Initialize services
var moment_service = require('./services/moment_service')(app, models);
// FIXME: Enable the chat service
//var chat_service = require('./services/chat_service')(app);

// Connect to database
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/express-mongodb-rabbitmq');

// On failure to connect, abort server startup and show error
db.on('error', console.error.bind(console, 'connection error:'));

// On successful connection, finalize server startup
db.once('open', function() {
    console.log("Connected to database successfully!");

    // Start web server
    http.listen(1337, function() {
        console.log('Server running at http://127.0.0.1:1337/');
    });
});
