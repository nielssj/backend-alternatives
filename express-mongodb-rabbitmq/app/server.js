var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var http = require("http");
var Q = require("q");

// Configure data models
var models = require("../models/data_model")(mongoose);

// Configure web server
var app = express()
    .use(express.query())
    .use(cors())
    .use(bodyParser.json())
    .use(cookieParser());
var server = http.createServer(app);

// Initialize services
var moment_service = require('../services/moment_service')(app, models);
// FIXME: Enable the chat service
//var chat_service = require('../services/chat_service')(app);

var Server = {
    start: function(config) {
        return Q.Promise(function(resolve, reject, notify) {
            // Connect to database
            var db = mongoose.connection;
            mongoose.connect(config.mongoCS);

            // On failure to connect, abort server startup and show error
            db.on('error', function(err) {
                console.error(err);
                reject(err);
            });

            // On successful connection, finalize server startup
            db.once('open', function() {
                console.log("Connected to database successfully!");

                // Start web server
                server.listen(config.port, function() {
                    console.log('Server running at http://127.0.0.1:' + config.port);
                    resolve();
                });
            });
        })
    },

    stop: server.close

};

module.exports = Server;