var amqp = require('amqplib');
var EventEmitter = require('events').EventEmitter;

var SERVICE_BASE = '/chat';

module.exports = function(app) {

    // Configure message bus
    var messageBus = new EventEmitter();
    messageBus.setMaxListeners(100);

    // Configure message broker
    var host = process.env.RABBITMQ_PORT_5672_TCP_ADDR;
    var port = process.env.RABBITMQ_PORT_5672_TCP_PORT;
    var uri = "amqp://" + host + ":" + port;
    var exchangeName = 'chat';
    var open = amqp.connect(uri);

    // Consumer endpoint
    app.get(SERVICE_BASE + '/messages', function(req, res) {
        messageBus.once('message',
            function(res, data) {
                res.send(data);
            }.bind(this, res)
        );
    });

    // Publisher endpoint
    app.post('/messages', function(req, res) {
        open.then(function(conn) {
            return conn.createChannel().then(function(channel) {
                channel
                    // Retrieve exchange (create if not exist)
                    .assertExchange(exchangeName, 'fanout', {durable: true})
                    // Send message to exchange
                    .then(function() {
                        channel.publish(exchangeName, '', new Buffer(req.body.message));
                        res.status(200).end();
                        return channel.close();
                    });
            });
        }).then(null, console.warn);
    });

    // Service subscription at message broker
    open.then(function(conn) {
        console.log("Connected to broker");
        return conn.createChannel().then(function(channel) {
            channel
                // Retrieve exchange (create if not exist)
                .assertExchange(exchangeName, 'fanout', {durable: true})
                /// Create exclusive queue
                .then(function() {
                    return channel.assertQueue('', {exclusive: true});
                })
                // Bind queue to exchange
                .then(function(qok) {
                    return channel.bindQueue(qok.queue, exchangeName, '').then(function() {
                        return qok.queue;
                    });
                })
                // Consume queue
                .then(function(queue) {
                    return channel.consume(queue, emitMessage, {noAck: true});
                })
                // Finally, let us know everything is ready
                .then(function() {
                    console.log("Connected and consuming...");
                });

            // Emit message callback
            function emitMessage(message) {
                if (message !== null) {
                    messageBus.emit('message', message.content.toString());
                    console.log("Received message: " + message.content.toString());
                    //channel.ack(message); (NOTE: No acknowledgement when publish/subscribe)
                }
            }
        });
    }).then(null, console.warn);
};