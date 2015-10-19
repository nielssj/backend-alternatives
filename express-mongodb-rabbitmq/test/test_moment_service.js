var expect = require('chai').expect;
var request = require('request');
var server = require('../app/server');

var port = 1338;
var req = request.defaults({
    baseUrl:  "http://127.0.0.1:" + port,
    json: true
});

describe('Moment service', function() {

    before(function(done) {
        server.start({
            port: port,
            mongoCS: "mongodb://localhost/express-mongodb-rabbitmq"
        }, done);
    });

    /*after(function() {
        server.stop();
    });*/

    it('returns a moment based on the id', function(done) {
        req.get('/moment/5623b13f12618795514b39cf')
            .on('data', function(data) {
                var resp = this.response;
                var body = JSON.parse(data);
                expect(resp.statusCode).to.equal(200);
                expect(body.authorName).to.equal("Niels Søholm");
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
            .on('response', function(resp) {
                expect(resp.statusCode).to.equal(404);
                done();
            })
            .on('error', done);
    });

    it('creates a moment upon valid POST', function(done) {
        var moment = {
            authorName: "John Doe",
            text: "Lorem ipsum.."
        };
        req.post('/moment', { body:moment })
            .on('data', function(data) {
                var resp = this.response;
                var body = JSON.parse(data);
                expect(resp.statusCode).to.equal(200);
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
});