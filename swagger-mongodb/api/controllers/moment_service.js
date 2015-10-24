var mongoose = require('mongoose');
var models = require("../models/data_model")(mongoose);

module.exports = {

    // Collection - POST
    postMoment: function(req, res) {
        res.type("json");

        var newMoment = new models.Moment(req.body);
        newMoment.save()
            .then(function() {
                res.send(newMoment._doc);
            })
            .then(null, errorHandler.bind(this, res));
    },

    // Collection - GET
    getMoments: function (req, res) {
        res.type("json");

        var query = models.Moment
            .find()
            .select({comments: 0}); // Don't select likes and comments for plural queries

        query.exec()
            .then(function(moments) {
                res.send(moments);
            })
            .then(null, errorHandler.bind(this, res));
    },

    // Element - GET
    getMoment: function(req, res, next) {
        res.type("json");

        var id = req.swagger.params.id.value;
        models.Moment.findById(id)
            .then(function(moment) {
                if(moment) {
                    res.send(moment);
                } else {
                    res.status(404).send();
                }
            })
            .then(null, errorHandler.bind(this, res));
    },

    // Element - PUT
    putMoment: function(req, res) {
        res.type("json");

        var id = req.swagger.params.id.value;
        models.Moment.findOne(id)
            .then(function(moment) {
                if(moment) {
                    return moment;
                } else {
                    res.status(404);
                }
            })
            .then(function(moment) {
                moment.set(req.body);
                return moment.save();
            })
            .then(function(moment) {
                res.send(moment);
            })
            .then(null, errorHandler.bind(this, res));
    },

    // Element - DELETE
    deleteMoment: function(req, res) {
        res.type("json");

        var id = req.swagger.params.id.value;
        models.Moment.findOneAndRemove({"_id":id})
            .then(function(deletedMoment) {
                if(deletedMoment) {
                    res.send(deletedMoment);
                } else {
                    res.status(404);
                }
            })
            .then(null, errorHandler.bind(this, res));
    }

};

// Generic error handler used throughout service
function errorHandler(res, err) {
    if (err.name == "ValidationError") {
        res.status(400).send(err.toString());
    } else {
        console.error("Failed to fulfill request", err);
        res.status(500).send("Unexpected error");
    }
}