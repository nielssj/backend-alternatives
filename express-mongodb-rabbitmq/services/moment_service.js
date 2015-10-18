

module.exports = function(app, models) {

// Create - Moment
app.post('/moment', function (req, res, next) {
    var newMoment = new models.Moment(req.body);

    newMoment.save()
        .then(function() {
            res.send(newMoment);
            next();
        })
        .then(null, errorHandler.bind(this, res, next));
});

// Read (plural) - Moment
app.get('/moment', function(req, res, next) {
    // Construct basic query
    var query = models.Moment
        .find()
        .select({comments: 0}); // Don't select likes and comments for plural queries

    query.exec()
        .then(function(moments) {
            res.send(moments);
            next();
        })
        .then(null, errorHandler.bind(this, res, next));
});

// Read - Moment
app.get('/moment/:id', function(req, res, next) {
    models.Moment.findById(req.params.id)
        .then(function(moment) {
            if(moment) {
                res.send(moment);
                next();
            } else {
                res.status(404);
                next();
            }
        })
        .then(null, errorHandler.bind(this, res, next));
});

// Update - Moment
app.put('/moment/:id', function(req, res, next) {
    models.Moment.findOne(req.params.id)
        .then(function(moment) {
            if(moment) {
                return moment;
            } else {
                res.status(404);
                next();
            }
        })
        .then(function(moment) {
            moment.set(req.body);
            return moment.save();
        })
        .then(function(moment) {
            res.send(moment);
            next();
        })
        .then(null, errorHandler.bind(this, res, next));
});

// Delete - Moment
app.delete('/moment/:id', function(req, res, next) {
    models.Moment.findOneAndRemove({"_id":req.params.id})
        .then(function(deletedMoment) {
            if(deletedMoment) {
                res.send(deletedMoment);
                next();
            } else {
                res.status(404);
                next();
            }
        })
        .then(null, errorHandler.bind(this, res, next));
});

// Generic error handler used throughout service
function errorHandler(res, next, err) {
    if (err.name == "ValidationError") {
        console.warn("Validation error", err);
        res.status(400).send(err.toString());
        next();
    } else {
        console.error("Failed to fulfill request", err);
        res.status(500).send("Unexpected error");
        next();
    }
}

};