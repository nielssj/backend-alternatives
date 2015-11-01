var mongoose = require('mongoose');
var models = require("../models/data_model")(mongoose);

module.exports = {

    postMoment: function(req, res) {
        res.type("json");

        var newMoment = new models.Moment(req.body);
        newMoment.save()
            .then(function() {
                res.send(newMoment._doc);
            })
            .then(null, errorHandler.bind(this, res));
    },

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
    },

    getComments: function (req, res) {
        res.type("json");

        var id = req.swagger.params.id.value;
        var query = models.Comment
            .find({ parentMoment:id });

        query.exec()
            .then(function(comments) {
                res.send(comments);
            })
            .then(null, errorHandler.bind(this, res));
    },

    postComment: function(req, res) {
        res.type("json");

        var newComment = new models.Comment(req.body);
        newComment.save()
            .then(function() {
                res.send(newComment._doc);
            })
            .then(null, errorHandler.bind(this, res));
    },

    deleteComment: function(req, res) {
        res.type("json");

        var cid = req.swagger.params.cid.value;
        models.Comment.findOneAndRemove({"_id":cid})
            .then(function(deletedComment) {
                if(deletedComment) {
                    res.send(deletedComment);
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