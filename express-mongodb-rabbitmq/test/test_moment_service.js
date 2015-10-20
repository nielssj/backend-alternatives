var expect = require('chai').expect;
var request = require('request');
var server = require('../app/server');
var MongoClient = require('mongodb').MongoClient;

var testData = require("./test_data");

var port = 1338;
var mongoCS = "mongodb://localhost/express-mongodb-rabbitmq";

var req = request.defaults({
    baseUrl:  "http://127.0.0.1:" + port,
    json: true
});

describe('Moment service', function() {

    before(function(done) {
        server.start({ port:port, mongoCS: mongoCS}).then(done);
    });

    beforeEach(function(done) {
        MongoClient.connect(mongoCS)
            .then(function(db) {
                // Drop and re-insert test data
                db.dropCollection("moments")
                    .then(null, function(err) { /* If collection does not exist and we can't drop it, that's okay too. */ })
                    .then(function(result) {
                        return db.collection('moments').insertMany(testData, { w:1 });
                    })
                    .then(db.close.bind(db, true, done))
                    .then(null, function(err) { done(err) });
            })
            .then(null, function(err) {
                console.log("Failed to connect to MongoDB, is it running?");
                done(err);
            })
    });

    describe('Collection - POST', function() {
        it('creates a moment upon valid POST', function(done) {
            var moment = {
                authorName: "John Doe",
                text: "This is a beautiful message"
            };
            req.post('/moment', { body:moment })
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(200);

                    var body = JSON.parse(data);
                    expect(body.authorName).to.equal(moment.authorName);
                    expect(body.text).to.equal(moment.text);
                    expect(body._id).to.be.a("String").and.have.length(24);
                    expect(body.created).to.be.a("String").and.have.length(24);
                    expect(body.modified).to.be.a("String").and.have.length(24);
                    expect(body.commentCount).to.equal(0);
                    done();
                })
                .on('error', done);
        });

        it('returns an appropriate error upon missing text field', function(done) {
            var moment = {
                authorName: "John Doe"
            };
            req.post('/moment', { body:moment })
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(400);
                    var body = String(data);
                    expect(body).to.be.a("string").and.to.contain("`text` is required");
                    done();
                })
                .on('error', done);
        });

        it('returns an appropriate error upon missing authorName', function(done) {
            var moment = {
                text: "This is a beautiful message"
            };
            req.post('/moment', { body:moment })
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(400);
                    var body = String(data);
                    expect(body).to.be.a("string").and.to.contain("`authorName` is required");
                    done();
                })
                .on('error', done);
        });

        it('returns an appropriate error upon empty body', function(done) {
            req.post('/moment')
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(400);
                    done();
                })
                .on('error', done);
        });
    });

    describe('Collection - GET', function() {
        it('returns all moments', function (done) {
            req.get('/moment')
                .on('data', function (data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(200);

                    var body = JSON.parse(data);
                    expect(body).to.be.an("Array").and.have.length(2);
                    done();
                })
                .on('error', done);
        });
    });

    describe('Element - GET', function() {
        it('returns a moment based on the id', function(done) {
            var moment = testData[0];
            var momentId = moment._id.toString();
            req.get('/moment/' + momentId)
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(200);

                    var body = JSON.parse(data);
                    expect(body.authorName).to.equal(moment.authorName);
                    expect(body.text).to.equal(moment.text);
                    expect(body._id).to.be.a("String").and.have.length(24);
                    expect(body.created).to.be.a("String").and.have.length(24);
                    expect(body.modified).to.be.a("String").and.have.length(24);
                    expect(body.commentCount).to.equal(0);
                    done();
                })
                .on('error', done);
        });

        it('returns "Not Found" upon an unknown ID', function(done) {
            req.get('/moment/5623b13f12618795514b39cd')
                .on('response', function(response) {
                    expect(response.statusCode).to.equal(404);
                    done();
                })
                .on('error', done);
        });
    });

    describe('Element - PUT', function() {
        it('updates a moments text upon valid UPDATE', function(done) {
            var momentId = testData[0]._id;
            var moment = {
                text: "This is a beautiful message"
            };
            req.put('/moment/' + momentId, { body:moment })
                .on('response', function(response) {

                })
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(200);

                    var body = JSON.parse(data);
                    expect(body.text).to.equal(moment.text);
                    expect(body.modified).to.not.equal(testData[0].modified);
                    expect(body.created).to.equal(testData[0].created);

                    MongoClient.connect(mongoCS)
                        .then(function(db) {
                            return db.collection("moments").findOne({"_id": testData[0]._id});
                        })
                        .then(function(dbMoment) {
                            expect(dbMoment.text).to.equal(moment.text);
                            done();
                        });
                })
                .on('error', done);
        });
    });

    describe('Element - DELETE', function() {
        it('deletes a moment upon valid DELETE', function(done) {
            var moment = testData[0];
            var momentId = moment._id.toString();
            req.del('/moment/' + momentId)
                .on('data', function(data) {
                    var response = this.response;
                    expect(response.statusCode).to.equal(200);

                    var body = JSON.parse(data);
                    expect(body.authorName).to.equal(moment.authorName);
                    expect(body.text).to.equal(moment.text);
                    expect(body._id).to.be.a("String").and.have.length(24);
                    expect(body.created).to.be.a("String").and.have.length(24);
                    expect(body.modified).to.be.a("String").and.have.length(24);
                    expect(body.commentCount).to.equal(0);

                    MongoClient.connect(mongoCS)
                        .then(function(db) {
                            return db.collection("moments").find().toArray()
                        })
                        .then(function(moments) {
                            expect(moments).to.have.length(1);
                            expect(moments[0]._id.toString()).to.equal(testData[1]._id.toString());
                            done();
                        });
                })
                .on('error', done);
        });
    });
});