'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  // Connect to database
  var db = mongoose.connection;
  mongoose.connect("mongodb://localhost/express-mongodb-rabbitmq");

  // On failure to connect, abort server startup and show error
  db.on('error', function(err) {
    console.error(err);
    reject(err);
  });

  // On successful connection, finalize server startup
  db.once('open', function() {
    console.log("Connected to database successfully!");

    // Start web server
    var port = process.env.PORT || 10010;
    app.listen(port);
  });
});
