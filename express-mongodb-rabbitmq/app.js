var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');

// Configure web server
var app = express()
    .use(express.query())
    .use(cors())
    .use(bodyParser.json())
    .use(cookieParser());
var http = require('http').Server(app);

// Initialize services
var moment_service = require('./services/moment_service')(app);
var chat_service = require('./services/chat_service')(app);

// Start listening
http.listen(1337, function() {
    console.log('Server running at http://127.0.0.1:1337/');
});